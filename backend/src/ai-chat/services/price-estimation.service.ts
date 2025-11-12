/**
 * AI-powered property price estimation service
 * Uses vector search to find comparable properties and GPT for analysis
 */

import Property from '../../models/Property.model';
import { generateQueryEmbedding } from '../../services/embedding.service';
import llmService from './llm.service';
import logger from '../../utils/logger';

export interface PriceEstimationRequest {
  location: {
    city: string;
    locality?: string;
  };
  propertyType?: 'apartment' | 'villa' | 'independent-house' | 'plot';
  bedrooms?: number;
  carpetArea?: number;
  amenities?: string[];
  propertyAge?: '<1' | '1-5' | '5-10' | '10+';
  furnishing?: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
}

export interface ComparableProperty {
  _id: string;
  title: string;
  location: string;
  price: number;
  pricePerSqft: number;
  bedrooms: number;
  carpetArea: number;
  amenities: string[];
  propertyAge: string;
  furnishing: string;
  soldDate?: Date;
  score?: number; // Similarity score from vector search
}

export interface PriceEstimate {
  estimatedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  pricePerSqft: number;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  factors: {
    locationPremium?: string;
    amenitiesImpact?: string;
    sizeAdjustment?: string;
    ageConsideration?: string;
    marketTrend?: string;
  };
  comparables: ComparableProperty[];
  dataQuality: {
    totalComparables: number;
    recentSales: number;
    similarProperties: number;
  };
  disclaimer: string;
}

class PriceEstimationService {
  /**
   * Estimate property price using AI and comparable properties
   */
  async estimatePrice(request: PriceEstimationRequest): Promise<PriceEstimate> {
    try {
      logger.info(`Estimating price for property in ${request.location.city}`);

      // Step 1: Find comparable properties using vector search
      const comparables = await this.findComparableProperties(request);

      if (comparables.length === 0) {
        return this.generateInsufficientDataResponse(request);
      }

      // Step 2: Calculate statistical metrics
      const stats = this.calculatePriceStatistics(comparables);

      // Step 3: Use GPT to analyze comparables and provide estimate
      const gptAnalysis = await this.generateGPTAnalysis(request, comparables, stats);

      // Step 4: Determine confidence level
      const confidence = this.calculateConfidence(comparables);

      // Step 5: Build final estimate
      return {
        estimatedPrice: stats.median,
        priceRange: {
          min: stats.percentile25,
          max: stats.percentile75
        },
        pricePerSqft: stats.medianPerSqft,
        confidence,
        explanation: gptAnalysis.explanation,
        factors: gptAnalysis.factors,
        comparables: comparables.slice(0, 5), // Top 5 most similar
        dataQuality: {
          totalComparables: comparables.length,
          recentSales: comparables.filter(c => c.soldDate).length,
          similarProperties: comparables.filter(c => (c.score || 0) > 0.8).length
        },
        disclaimer: this.getDisclaimer()
      };

    } catch (error: any) {
      logger.error('Price estimation error:', error);
      throw new Error('Failed to estimate property price');
    }
  }

  /**
   * Find comparable properties using vector search and filters
   */
  private async findComparableProperties(
    request: PriceEstimationRequest
  ): Promise<ComparableProperty[]> {
    try {
      // Build search query for vector search
      const searchQuery = this.buildSearchQuery(request);

      // Generate embedding for the query
      const queryEmbedding = await generateQueryEmbedding(searchQuery);

      if (!queryEmbedding) {
        // Fallback to text search if vector search unavailable
        return this.findComparablesTextSearch(request);
      }

      // Build aggregation pipeline for vector search
      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: 'property_vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 20
          }
        },
        {
          $addFields: {
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ];

      // Add filters for better comparables
      const matchFilters: any = {};

      // Location filter (must match city)
      matchFilters['address.city'] = new RegExp(request.location.city, 'i');

      // Property type filter
      if (request.propertyType) {
        matchFilters.propertyType = request.propertyType;
      }

      // Bedroom filter (allow ±1 bedroom)
      if (request.bedrooms) {
        matchFilters['specs.bedrooms'] = {
          $gte: request.bedrooms - 1,
          $lte: request.bedrooms + 1
        };
      }

      // Only include properties with prices
      matchFilters['pricing.expectedPrice'] = { $exists: true, $gt: 0 };

      // Prefer sold properties, but include active listings
      matchFilters.status = { $in: ['sold', 'approved'] };

      pipeline.push({ $match: matchFilters });

      // Project fields we need
      pipeline.push({
        $project: {
          title: 1,
          'address.city': 1,
          'address.fullAddress': 1,
          'pricing.expectedPrice': 1,
          'specs.bedrooms': 1,
          'specs.carpetArea': 1,
          'specs.propertyAge': 1,
          'specs.furnishing': 1,
          amenities: 1,
          status: 1,
          soldAt: 1,
          score: 1
        }
      });

      // Execute search
      const results = await Property.aggregate(pipeline);

      // Transform to ComparableProperty format
      return results.map((prop: any) => ({
        _id: prop._id.toString(),
        title: prop.title,
        location: `${prop.address.city}`,
        price: prop.pricing.expectedPrice,
        pricePerSqft: prop.pricing.expectedPrice / (prop.specs.carpetArea || 1),
        bedrooms: prop.specs.bedrooms,
        carpetArea: prop.specs.carpetArea,
        amenities: prop.amenities || [],
        propertyAge: prop.specs.propertyAge,
        furnishing: prop.specs.furnishing,
        soldDate: prop.soldAt,
        score: prop.score
      }));

    } catch (error: any) {
      logger.error('Error finding comparables:', error);
      return [];
    }
  }

  /**
   * Fallback text-based search for comparables
   */
  private async findComparablesTextSearch(
    request: PriceEstimationRequest
  ): Promise<ComparableProperty[]> {
    const query: any = {
      'address.city': new RegExp(request.location.city, 'i'),
      'pricing.expectedPrice': { $exists: true, $gt: 0 },
      status: { $in: ['sold', 'approved'] }
    };

    if (request.propertyType) {
      query.propertyType = request.propertyType;
    }

    if (request.bedrooms) {
      query['specs.bedrooms'] = {
        $gte: request.bedrooms - 1,
        $lte: request.bedrooms + 1
      };
    }

    const results = await Property.find(query)
      .select('title address pricing specs amenities soldAt')
      .limit(20);

    return results.map((prop: any) => ({
      _id: prop._id.toString(),
      title: prop.title,
      location: `${prop.address.city}`,
      price: prop.pricing.expectedPrice,
      pricePerSqft: prop.pricing.expectedPrice / (prop.specs.carpetArea || 1),
      bedrooms: prop.specs.bedrooms,
      carpetArea: prop.specs.carpetArea,
      amenities: prop.amenities || [],
      propertyAge: prop.specs.propertyAge,
      furnishing: prop.specs.furnishing,
      soldDate: prop.soldAt,
      score: 0.7 // Default score for text search
    }));
  }

  /**
   * Build search query string for vector search
   */
  private buildSearchQuery(request: PriceEstimationRequest): string {
    const parts: string[] = [];

    parts.push(`${request.bedrooms || ''} BHK`);
    parts.push(request.propertyType || 'property');
    parts.push(`in ${request.location.city}`);

    if (request.location.locality) {
      parts.push(request.location.locality);
    }

    if (request.carpetArea) {
      parts.push(`${request.carpetArea} sqft`);
    }

    if (request.furnishing) {
      parts.push(request.furnishing);
    }

    if (request.amenities && request.amenities.length > 0) {
      parts.push(`with ${request.amenities.slice(0, 3).join(', ')}`);
    }

    return parts.filter(p => p).join(' ');
  }

  /**
   * Calculate price statistics from comparables
   */
  private calculatePriceStatistics(comparables: ComparableProperty[]) {
    const prices = comparables.map(c => c.price).sort((a, b) => a - b);
    const pricesPerSqft = comparables
      .filter(c => c.carpetArea > 0)
      .map(c => c.pricePerSqft)
      .sort((a, b) => a - b);

    return {
      median: this.calculateMedian(prices),
      mean: prices.reduce((a, b) => a + b, 0) / prices.length,
      percentile25: prices[Math.floor(prices.length * 0.25)],
      percentile75: prices[Math.floor(prices.length * 0.75)],
      min: prices[0],
      max: prices[prices.length - 1],
      medianPerSqft: this.calculateMedian(pricesPerSqft),
      count: comparables.length
    };
  }

  /**
   * Calculate median value
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const mid = Math.floor(values.length / 2);
    return values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid];
  }

  /**
   * Use GPT to analyze comparables and provide insights
   */
  private async generateGPTAnalysis(
    request: PriceEstimationRequest,
    comparables: ComparableProperty[],
    stats: any
  ): Promise<{ explanation: string; factors: any }> {
    const prompt = this.buildGPTPrompt(request, comparables, stats);

    try {
      const response = await llmService.generateWithSystemPrompt(
        'You are a real estate pricing expert providing accurate price estimates.',
        prompt
      );

      // Parse GPT response
      return this.parseGPTResponse(response.content);

    } catch (error: any) {
      logger.error('GPT analysis error:', error);
      // Fallback to basic explanation
      return {
        explanation: `Based on ${comparables.length} comparable properties in ${request.location.city}, the estimated price is ₹${(stats.median / 10000000).toFixed(2)} Crores.`,
        factors: {}
      };
    }
  }

  /**
   * Build GPT prompt for price analysis
   */
  private buildGPTPrompt(
    request: PriceEstimationRequest,
    comparables: ComparableProperty[],
    stats: any
  ): string {
    const compsText = comparables.slice(0, 5).map((c, i) => 
      `${i + 1}. ${c.title} - ₹${(c.price / 10000000).toFixed(2)} Cr, ${c.bedrooms}BHK, ${c.carpetArea} sqft, ${c.furnishing}`
    ).join('\n');

    return `You are a real estate pricing expert. Analyze these comparable properties and provide a price estimate.

**Property to Estimate:**
- Location: ${request.location.city}${request.location.locality ? ', ' + request.location.locality : ''}
- Type: ${request.propertyType || 'Not specified'}
- Bedrooms: ${request.bedrooms || 'Not specified'}
- Carpet Area: ${request.carpetArea ? request.carpetArea + ' sqft' : 'Not specified'}
- Furnishing: ${request.furnishing || 'Not specified'}

**Comparable Properties:**
${compsText}

**Statistics:**
- Median Price: ₹${(stats.median / 10000000).toFixed(2)} Crores
- Price Range: ₹${(stats.percentile25 / 10000000).toFixed(2)} - ₹${(stats.percentile75 / 10000000).toFixed(2)} Crores
- Median Price/Sqft: ₹${stats.medianPerSqft.toFixed(0)}
- Total Comparables: ${stats.count}

**Task:**
Provide a clear, concise explanation of the price estimate. Consider:
1. Location desirability and trends
2. Property size and type
3. Amenities and furnishing
4. Market conditions

Format your response as:
EXPLANATION: [2-3 sentences explaining the estimate]
FACTORS:
- Location: [brief insight]
- Size: [brief insight]
- Amenities: [brief insight]
- Market: [brief insight]`;
  }

  /**
   * Parse GPT response into structured format
   */
  private parseGPTResponse(content: string): { explanation: string; factors: any } {
    const lines = content.split('\n');
    let explanation = '';
    const factors: any = {};

    let section = '';
    for (const line of lines) {
      if (line.startsWith('EXPLANATION:')) {
        section = 'explanation';
        explanation = line.replace('EXPLANATION:', '').trim();
      } else if (line.startsWith('FACTORS:')) {
        section = 'factors';
      } else if (section === 'explanation' && line.trim()) {
        explanation += ' ' + line.trim();
      } else if (section === 'factors' && line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim());
        const cleanKey = key.replace(/^-\s*/, '').toLowerCase();
        factors[cleanKey] = value;
      }
    }

    return { explanation, factors };
  }

  /**
   * Calculate confidence level based on data quality
   */
  private calculateConfidence(comparables: ComparableProperty[]): 'low' | 'medium' | 'high' {
    const count = comparables.length;
    const highSimilarity = comparables.filter(c => (c.score || 0) > 0.85).length;
    const recentSales = comparables.filter(c => c.soldDate).length;

    if (count >= 10 && highSimilarity >= 5 && recentSales >= 3) {
      return 'high';
    } else if (count >= 5 && highSimilarity >= 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate response when insufficient data
   */
  private generateInsufficientDataResponse(request: PriceEstimationRequest): PriceEstimate {
    return {
      estimatedPrice: 0,
      priceRange: { min: 0, max: 0 },
      pricePerSqft: 0,
      confidence: 'low',
      explanation: `We don't have enough comparable properties in ${request.location.city} to provide a reliable price estimate. This could be due to limited data in this specific area or property type. We recommend consulting with local real estate agents for more accurate pricing.`,
      factors: {},
      comparables: [],
      dataQuality: {
        totalComparables: 0,
        recentSales: 0,
        similarProperties: 0
      },
      disclaimer: this.getDisclaimer()
    };
  }

  /**
   * Legal disclaimer for price estimates
   */
  private getDisclaimer(): string {
    return 'This is an AI-generated estimate based on available market data and should not be considered a professional property appraisal or valuation. Actual property values may vary based on factors not captured in our analysis. For official valuations, please consult a licensed property appraiser.';
  }
}

export default new PriceEstimationService();

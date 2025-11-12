# 🤖 AI Chat Widget

Modern, responsive chat widget for conversational property search powered by GPT-4.

## 📁 Components

### `ChatWidget.tsx`
- **Main component** - Floating chat button and window
- **Features:**
  - Floating button (bottom-right)
  - Expandable chat window
  - Auto-scroll to latest message
  - Typing indicators
  - Error handling
  - Health check integration
  - Responsive design (mobile + desktop)

### `ChatMessage.tsx`
- **Message bubbles** with user/assistant styling
- **Property cards** display
- **Suggested questions** chips
- **Timestamps**
- **Avatars** (User/Bot)

### `PropertyCard.tsx`
- **Property preview cards** in chat
- **Features:**
  - Property image or placeholder
  - Title, location, price
  - Bedrooms, area
  - Match score indicator
  - Match reason
  - Click to view details

## 🎨 Design

### Color Scheme
- **Primary:** Blue 600 (#2563eb)
- **User Messages:** Blue 600 background
- **Bot Messages:** Gray 100/800 background
- **Dark Mode:** Fully supported

### Layout
- **Chat Window:** 384px width (mobile: full width)
- **Max Height:** 80vh (600px default)
- **Floating Button:** 56x56px, bottom-right

## 🔧 Features

### ✅ Implemented
- [x] Floating chat button
- [x] Expandable chat window
- [x] Message history
- [x] Typing indicators
- [x] Property suggestions
- [x] Suggested questions
- [x] Auto-scroll
- [x] Dark mode support
- [x] Mobile responsive
- [x] Error handling
- [x] Health check
- [x] Navigation to property details
- [x] Login redirect if unauthorized

### 🎯 Future Enhancements
- [ ] Conversation history (last 5 conversations)
- [ ] Export conversation
- [ ] Voice input
- [ ] Image upload
- [ ] Minimize to sidebar
- [ ] Unread message count
- [ ] Sound notifications
- [ ] Keyboard shortcuts

## 📱 Responsive Design

### Mobile (< 640px)
- Full-width chat window
- Optimized touch targets
- Smaller button size

### Tablet (640px - 1024px)
- 384px fixed width
- Positioned right side

### Desktop (> 1024px)
- 384px fixed width
- Bottom-right corner
- Hover effects

## 🚀 Usage

The widget is automatically included in all pages via the `Layout` component.

### Manual Usage

```tsx
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div>
      {/* Your app */}
      <ChatWidget />
    </div>
  );
}
```

## 🧪 Testing

### Test Scenarios

1. **Open/Close Chat**
   - Click floating button
   - Window opens/closes smoothly
   - Messages persist

2. **Send Message**
   - Type message
   - Press Enter or click Send
   - Typing indicator appears
   - Bot response displays

3. **Property Suggestions**
   - Bot shows property cards
   - Click property card
   - Navigates to property details
   - Chat closes

4. **Suggested Questions**
   - Click suggested question
   - Message auto-fills
   - Sends automatically

5. **Error Handling**
   - Disconnect network
   - Send message
   - Error message displays
   - Can retry

6. **Unauthorized**
   - Logout
   - Try to send message
   - Login prompt appears
   - Click redirects to login

## 🎛️ Customization

### Change Colors

Edit `ChatWidget.tsx`:

```tsx
// Change primary color
className="bg-blue-600" // Change to your brand color
```

### Change Position

```tsx
// Change button position
className="fixed bottom-4 left-4" // Move to bottom-left
```

### Change Size

```tsx
// Change chat window size
className="w-96 h-[600px]" // Adjust width and height
```

### Welcome Message

Edit `ChatWidget.tsx` line ~58:

```tsx
const welcomeMessage: ChatMessageType = {
  content: "Your custom welcome message!",
  // ...
};
```

## 🔗 Integration

### With Property Pages

Click on property card → navigates to `/property/:id`

### With Authentication

- Checks auth token from `api.ts`
- Shows login prompt if not authenticated
- Redirects to `/login` on "Go to Login" click

### With Backend

Uses `/api/v1/ai-chat/*` endpoints:
- `POST /ai-chat/message` - Send message
- `GET /ai-chat/health` - Check availability

## 🐛 Troubleshooting

### Chat button not showing
- Check if backend `/ai-chat/health` returns `llm: true`
- Verify `ENABLE_VECTORIZATION=true` in backend `.env`

### Messages not sending
- Check if user is logged in
- Verify API endpoint is correct
- Check browser console for errors

### Properties not clickable
- Verify `useNavigate` is imported
- Check property IDs are valid

### Dark mode issues
- Ensure Tailwind dark mode is configured
- Check `dark:` classes are present

## 📚 Dependencies

- `react` - UI framework
- `react-router-dom` - Navigation
- `lucide-react` - Icons
- `tailwindcss` - Styling

## 💡 Tips

1. **Performance:** Messages are stored in component state, cleared on close
2. **Accessibility:** All interactive elements have proper ARIA labels
3. **Mobile:** Touch targets are 44x44px minimum
4. **UX:** Auto-focus input when chat opens

## 🎉 Features Demo

Try these prompts:
- "Show me 2BHK in Hyderabad"
- "Properties under 50 lakhs"
- "Apartments near IT companies"
- "Compare these properties"
- "Show me something similar"

---

**Built with ❤️ using React + TypeScript + TailwindCSS**

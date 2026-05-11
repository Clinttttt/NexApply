# Messages Feature Implementation Summary

## Feature: Company Messages
**Role:** Company
**Page:** CompanyMessages.tsx

---

## Backend Implementation (Complete)

### 1. Entity (DDD)
**Location:** `NexApply.Api/Entities/Message.cs`

**Properties:**
- SenderId (Guid)
- ReceiverId (Guid)
- Content (string)
- Type (string) - "text" or "interview-invite"
- IsRead (bool)
- InterviewId (Guid?)

**Factory Methods:**
- `CreateTextMessage(senderId, receiverId, content)`
- `CreateInterviewInvite(senderId, receiverId, content, interviewId)`

**Domain Methods:**
- `MarkAsRead()`

---

### 2. Contracts (Shared Layer)
**Location:** `NexApply.Contracts/Messages/`

#### DTOs
- **ConversationDto** - Conversation list item with user info, last message, application details
- **MessageDto** - Individual message with content, timestamp, type
- **InterviewInviteDetailsDto** - Interview invitation details (position, date, time, format)

#### Queries
- **GetConversationsQuery** - Fetch all conversations for current user
- **GetMessagesQuery(OtherUserId)** - Fetch messages between two users

#### Commands
- **SendMessageCommand(ReceiverId, Content)** - Send text message

---

### 3. Handlers
**Location:** `NexApply.Api/Features/Messages/`

#### GetConversations
- **Handler:** Groups messages by conversation partner
- **Logic:** Joins with Users, StudentProfiles, CompanyProfiles, Applications
- **Returns:** List of conversations with last message, read status, application stage

#### GetMessages
- **Handler:** Fetches messages between current user and other user
- **Logic:** Includes interview details if type is "interview-invite"
- **Side Effect:** Marks unread messages as read

#### SendMessage
- **Handler:** Creates new text message
- **Validator:** Content required, max 5000 chars
- **Returns:** Created message DTO

---

### 4. Endpoints
**Location:** `NexApply.Api/Features/Messages/*/Endpoint.cs`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/messages/conversations` | GET | Company | Get all conversations |
| `/api/messages/{otherUserId}` | GET | Authenticated | Get messages with user |
| `/api/messages` | POST | Authenticated | Send message |

---

### 5. Database Updates
**Location:** `NexApply.Api/Data/AppDbContext.cs`

**Added:**
- `DbSet<Message> Messages`
- Message entity configuration with indexes on (SenderId, ReceiverId) and CreatedAt

**Migration Required:** Yes - Run `dotnet ef migrations add AddMessagesTable`

---

## Frontend Integration (Next Steps)

### 1. TypeScript Types
**Location:** `NexApply.Web/src/services/messageService.ts`

```typescript
export interface ConversationDto {
  userId: string;
  name: string;
  role: string;
  jobTitle: string;
  isRead: boolean;
  isOnline: boolean;
  lastSenderIsMe: boolean;
  lastMessage: string;
  lastMessageAt: string;
  applicationStage?: string;
  matchScore: number;
  applicantId?: string;
  appliedDate?: string;
  skills?: string[];
}

export interface MessageDto {
  id: string;
  senderId: string;
  content: string;
  sentAt: string;
  type: string;
  inviteDetails?: InterviewInviteDetailsDto;
}

export interface InterviewInviteDetailsDto {
  position: string;
  dateDisplay: string;
  timeDisplay: string;
  format: string;
}

export interface SendMessageCommand {
  receiverId: string;
  content: string;
}
```

---

### 2. API Service
**Location:** `NexApply.Web/src/services/messageService.ts`

```typescript
import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export const messageService = {
  async getConversations(): Promise<Result<ConversationDto[]>> {
    try {
      const response = await apiClient.get<ConversationDto[]>('/api/messages/conversations');
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to load conversations',
        statusCode: error.response?.status
      };
    }
  },

  async getMessages(otherUserId: string): Promise<Result<MessageDto[]>> {
    try {
      const response = await apiClient.get<MessageDto[]>(`/api/messages/${otherUserId}`);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to load messages',
        statusCode: error.response?.status
      };
    }
  },

  async sendMessage(command: SendMessageCommand): Promise<Result<MessageDto>> {
    try {
      const response = await apiClient.post<MessageDto>('/api/messages', command);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to send message',
        statusCode: error.response?.status
      };
    }
  }
};
```

---

### 3. Update CompanyMessages.tsx
Replace mock data with API calls:

```typescript
// At top of component
const [conversations, setConversations] = useState<ConversationDto[]>([]);
const [messages, setMessages] = useState<MessageDto[]>([]);
const [isLoading, setIsLoading] = useState(true);

// Load conversations on mount
useEffect(() => {
  const loadConversations = async () => {
    setIsLoading(true);
    const result = await messageService.getConversations();
    if (result.isSuccess && result.value) {
      setConversations(result.value);
    }
    setIsLoading(false);
  };
  loadConversations();
}, []);

// Load messages when conversation selected
useEffect(() => {
  if (!activeConvId) return;
  
  const loadMessages = async () => {
    const result = await messageService.getMessages(activeConvId);
    if (result.isSuccess && result.value) {
      setMessages(result.value);
    }
  };
  loadMessages();
}, [activeConvId]);

// Send message
const sendMessage = async () => {
  if (!composeText.trim() || !activeConvId) return;
  
  const result = await messageService.sendMessage({
    receiverId: activeConvId,
    content: composeText.trim()
  });
  
  if (result.isSuccess && result.value) {
    setMessages([...messages, result.value]);
    setComposeText('');
  }
};
```

---

## Architecture Compliance ✅

- ✅ **VSA + DDD** - Self-contained slices with rich domain entity
- ✅ **Contracts Layer** - Commands, Queries, DTOs in shared layer
- ✅ **Result<T> Pattern** - All handlers return Result<T>
- ✅ **MediatR** - CQRS with handlers
- ✅ **FluentValidation** - Validator for SendMessageCommand
- ✅ **Minimal API** - Static endpoint classes
- ✅ **Authorization** - [Authorize] attributes on endpoints
- ✅ **CurrentUser Service** - Injected for authenticated user context
- ✅ **DateTime.UtcNow** - Used in BaseEntity
- ✅ **DDD Entity Methods** - Factory methods and domain methods

---

## Next Steps

1. **Run Migration:**
   ```bash
   cd NexApply.Api
   dotnet ef migrations add AddMessagesTable
   dotnet ef database update
   ```

2. **Create Frontend Service:**
   - Create `NexApply.Web/src/services/messageService.ts`
   - Add types and API methods

3. **Update CompanyMessages.tsx:**
   - Replace mock data with API calls
   - Add loading/error states
   - Wire up send message functionality

4. **Test:**
   - Test conversation list loading
   - Test message fetching
   - Test sending messages
   - Test read status updates

---

## API Endpoints Summary

| Endpoint | Method | Auth | Request | Response |
|----------|--------|------|---------|----------|
| `/api/messages/conversations` | GET | Company | - | `List<ConversationDto>` |
| `/api/messages/{otherUserId}` | GET | Auth | `Guid otherUserId` | `List<MessageDto>` |
| `/api/messages` | POST | Auth | `SendMessageCommand` | `MessageDto` |

---

## Notes

- **Interview Invites:** Currently handled by ScheduleInterviewCommand (existing feature)
  - When interview is scheduled, a message with type "interview-invite" should be created
  - Update ScheduleInterviewHandler to create message after interview creation

- **Real-time Updates:** Consider adding SignalR for real-time message delivery in future

- **Notifications:** Unread message count can be calculated from conversations list

- **Search/Filter:** Frontend already has search/filter UI, backend returns all conversations

- **Online Status:** Currently hardcoded to false, implement with SignalR or last activity tracking

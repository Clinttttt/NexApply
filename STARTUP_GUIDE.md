# NexApply Startup Guide

## Running the Application

### 1. Start the Backend API

```bash
cd C:\Users\ASUS VIVOBOOK\Documents\Repository\NexApply\NexApply.Api
dotnet run
```

**Expected output:**
```
Now listening on: https://localhost:7279
Application started. Press Ctrl+C to shut down.
```

### 2. Start the Frontend Dev Server

Open a **NEW terminal** and run:

```bash
cd C:\Users\ASUS VIVOBOOK\Documents\Repository\NexApply\NexApply.Web
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 3. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

**⚠️ IMPORTANT:** 
- Do NOT open `file:///...` URLs
- Do NOT open from the `dist` folder
- MUST use `http://localhost:3000`

## How It Works

```
Browser (localhost:3000)
    ↓
Vite Dev Server (proxy)
    ↓
Backend API (localhost:7279)
```

When you make a request to `/api/public/stats`:
1. Browser sends request to `http://localhost:3000/api/public/stats`
2. Vite proxy forwards it to `https://localhost:7279/api/public/stats`
3. Backend processes and responds
4. Response goes back through proxy to browser

## Troubleshooting

### No API calls showing in backend console?

**Check:**
1. ✅ Is frontend dev server running? (`npm run dev`)
2. ✅ Are you accessing `http://localhost:3000`?
3. ✅ Open browser console (F12) → Network tab
4. ✅ Refresh page and check for `/api/public/stats` and `/api/public/feedback` calls

### API calls failing?

**Check browser console for errors:**
- `ERR_CONNECTION_REFUSED` → Backend not running
- `404 Not Found` → Endpoint not registered
- `CORS error` → CORS policy issue (should be fixed with proxy)

### Still not working?

1. Stop both servers (Ctrl+C)
2. Clear browser cache
3. Restart backend: `dotnet run`
4. Restart frontend: `npm run dev`
5. Hard refresh browser: `Ctrl+Shift+R`

## Verifying It Works

When you load the login page, you should see in the **backend console**:

```
info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting HTTP/2 GET https://localhost:7279/api/public/stats
info: Microsoft.AspNetCore.Hosting.Diagnostics[2]
      Request finished HTTP/2 GET https://localhost:7279/api/public/stats - 200

info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting HTTP/2 GET https://localhost:7279/api/public/feedback
info: Microsoft.AspNetCore.Hosting.Diagnostics[2]
      Request finished HTTP/2 GET https://localhost:7279/api/public/feedback - 200
```

And in the **browser console** (F12 → Network tab):
- `api/public/stats` → Status 200
- `api/public/feedback` → Status 200

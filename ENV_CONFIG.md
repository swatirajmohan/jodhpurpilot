# Environment Configuration

## Backend URL Configuration

The frontend uses an environment variable to configure the backend API URL.

### For Local Development

Create a file named `.env.local` in the project root:

```
VITE_PDF_API_BASE=http://localhost:3001
```

### Default Value

If not set, defaults to: `http://localhost:3001`

### How It Works

- Configuration is in `src/config/api.ts`
- Uses `import.meta.env.VITE_PDF_API_BASE`
- All backend calls go through this config

### For Production

Set the environment variable in your deployment platform (Vercel, etc.):

```
VITE_PDF_API_BASE=https://your-backend-domain.com
```


# File Upload API Documentation

## Overview
This API provides file upload functionality using Supabase Storage. All endpoints require authentication.

## Base URL
```
http://localhost:5000/api/upload
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Upload Single File

**Endpoint:** `POST /api/upload/single`

**Description:** Upload a single file to Supabase Storage

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - `file` (required): The file to upload
- **Query Parameters:**
  - `folder` (optional): Folder name in storage (default: "uploads")

**Allowed File Types:**
- Images: JPEG, JPG, PNG
- Documents: PDF

**File Size Limit:** 5MB (configurable via `MAX_FILE_SIZE` in .env)

**Example Request (using curl):**
```bash
curl -X POST http://localhost:5000/api/upload/single?folder=avatars \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://xmwfjseqhqqkoqhrovtk.supabase.co/storage/v1/object/public/surlink-uploads/avatars/user123/1234567890-abc123.jpg",
    "path": "avatars/user123/1234567890-abc123.jpg",
    "fileName": "image.jpg",
    "fileSize": 102400,
    "mimeType": "image/jpeg"
  }
}
```

**Error Responses:**
- `400`: No file uploaded
- `413`: File too large
- `415`: Invalid file type
- `500`: Upload failed

---

### 2. Upload Multiple Files

**Endpoint:** `POST /api/upload/multiple`

**Description:** Upload multiple files at once (max 5 files)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - `files[]` (required): Array of files to upload
- **Query Parameters:**
  - `folder` (optional): Folder name in storage (default: "uploads")

**Example Request (using curl):**
```bash
curl -X POST http://localhost:5000/api/upload/multiple?folder=documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.jpg"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "2 file(s) uploaded successfully",
  "data": {
    "files": [
      {
        "url": "https://xmwfjseqhqqkoqhrovtk.supabase.co/storage/v1/object/public/surlink-uploads/documents/user123/1234567890-abc123.pdf",
        "path": "documents/user123/1234567890-abc123.pdf",
        "fileName": "file1.pdf",
        "fileSize": 204800,
        "mimeType": "application/pdf"
      },
      {
        "url": "https://xmwfjseqhqqkoqhrovtk.supabase.co/storage/v1/object/public/surlink-uploads/documents/user123/1234567891-def456.jpg",
        "path": "documents/user123/1234567891-def456.jpg",
        "fileName": "file2.jpg",
        "fileSize": 153600,
        "mimeType": "image/jpeg"
      }
    ],
    "count": 2
  }
}
```

---

### 3. Delete File

**Endpoint:** `DELETE /api/upload`

**Description:** Delete a file from Supabase Storage

**Request:**
- **Content-Type:** `application/json`
- **Body Parameters:**
  - `filePath` (required): The file path returned from upload

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filePath": "avatars/user123/1234567890-abc123.jpg"}'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "path": "avatars/user123/1234567890-abc123.jpg"
  }
}
```

---

### 4. Get Signed URL

**Endpoint:** `GET /api/upload/signed-url`

**Description:** Generate a temporary signed URL for accessing private files

**Request:**
- **Query Parameters:**
  - `filePath` (required): The file path
  - `expiresIn` (optional): Expiration time in seconds (default: 3600)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/upload/signed-url?filePath=private/user123/document.pdf&expiresIn=7200" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Signed URL generated successfully",
  "data": {
    "url": "https://xmwfjseqhqqkoqhrovtk.supabase.co/storage/v1/object/sign/surlink-uploads/private/user123/document.pdf?token=...",
    "expiresIn": 7200
  }
}
```

---

## File Organization

Files are automatically organized in the following structure:
```
surlink-uploads/
├── uploads/
│   └── {userId}/
│       └── {timestamp}-{random}.{ext}
├── avatars/
│   └── {userId}/
│       └── {timestamp}-{random}.{ext}
├── documents/
│   └── {userId}/
│       └── {timestamp}-{random}.{ext}
└── [custom-folder]/
    └── {userId}/
        └── {timestamp}-{random}.{ext}
```

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Common Error Codes

- `400 Bad Request`: Missing required parameters or invalid file
- `401 Unauthorized`: Missing or invalid JWT token
- `413 Payload Too Large`: File exceeds size limit
- `415 Unsupported Media Type`: Invalid file type
- `500 Internal Server Error`: Server or storage error

## Setup Instructions

### 1. Create Supabase Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the sidebar
4. Click **New bucket**
5. Enter bucket name: `surlink-uploads`
6. Choose bucket type:
   - **Public**: Files are accessible via public URLs (recommended for avatars, images)
   - **Private**: Files require signed URLs (recommended for sensitive documents)
7. Click **Create bucket**

### 2. Configure Bucket Policies (Optional)

For public buckets, you may want to set policies:

**Allow public read access:**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'surlink-uploads' );
```

**Allow authenticated users to upload:**
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'surlink-uploads'
  AND auth.role() = 'authenticated'
);
```

**Allow users to delete their own files:**
```sql
CREATE POLICY "User Delete Own Files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'surlink-uploads'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

### 3. Environment Configuration

Make sure your `.env.local` file has:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=surlink-uploads
MAX_FILE_SIZE=5242880
```

## Frontend Integration Example

### Using Fetch API

```javascript
async function uploadFile(file, folder = 'uploads') {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`http://localhost:5000/api/upload/single?folder=${folder}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${yourJwtToken}`
    },
    body: formData
  });

  const data = await response.json();
  return data;
}

// Usage
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const result = await uploadFile(file, 'avatars');
console.log(result.data.url); // Public URL of uploaded file
```

### Using Axios

```javascript
import axios from 'axios';

async function uploadFile(file, folder = 'uploads') {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `http://localhost:5000/api/upload/single?folder=${folder}`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${yourJwtToken}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
}
```

### React Example with Progress

```jsx
import { useState } from 'react';
import axios from 'axios';

function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/upload/single?folder=avatars',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );

      setFileUrl(response.data.data.url);
      console.log('Upload successful:', response.data);
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Uploading: {progress}%</p>}
      {fileUrl && <img src={fileUrl} alt="Uploaded" />}
    </div>
  );
}
```

## Notes

- Files are automatically organized by user ID
- File names are timestamped and randomized to prevent collisions
- Public bucket files are accessible via public URLs
- Private bucket files require signed URLs for access
- All uploads are done through Supabase Storage for scalability
- The API supports multiple file types - adjust `fileFilter` in [upload.js](src/utils/upload.js) as needed

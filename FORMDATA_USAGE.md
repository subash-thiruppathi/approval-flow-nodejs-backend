# FormData Usage Guide for Expense API

## Overview
The expense creation endpoint has been updated to handle FormData for file uploads. This allows users to upload receipt images along with their expense data.

## API Changes

### Endpoint: POST /api/expenses

**Previous (JSON):**
```javascript
// Content-Type: application/json
{
  "title": "Office Supplies",
  "amount": 150.00,
  "description": "Purchased office supplies",
  "category": "Office",
  "receipt_url": "https://example.com/receipt.jpg"
}
```

**Updated (FormData):**
```javascript
// Content-Type: multipart/form-data
const formData = new FormData();
formData.append('title', 'Office Supplies');
formData.append('amount', '150.00');
formData.append('description', 'Purchased office supplies');
formData.append('category', 'Office');
formData.append('receipt', fileInput.files[0]); // File object
```

## Frontend Implementation Examples

### JavaScript (Vanilla)
```javascript
const createExpense = async (expenseData, receiptFile) => {
  const formData = new FormData();
  formData.append('title', expenseData.title);
  formData.append('amount', expenseData.amount);
  formData.append('description', expenseData.description);
  formData.append('category', expenseData.category);
  
  if (receiptFile) {
    formData.append('receipt', receiptFile);
  }

  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type header - browser will set it automatically with boundary
    },
    body: formData
  });

  return response.json();
};
```

### React Example
```jsx
const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    category: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('amount', formData.amount);
    data.append('description', formData.description);
    data.append('category', formData.category);
    
    if (receiptFile) {
      data.append('receipt', receiptFile);
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });
      
      const result = await response.json();
      console.log('Expense created:', result);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
        required
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <input
        type="text"
        placeholder="Category"
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setReceiptFile(e.target.files[0])}
      />
      <button type="submit">Create Expense</button>
    </form>
  );
};
```

## File Upload Specifications

- **Accepted file types**: Image files only (jpg, jpeg, png, gif, etc.)
- **Maximum file size**: 5MB
- **Storage location**: Files are stored locally in the `uploads/` directory
- **File naming**: Files are automatically renamed with timestamp and random suffix
- **Access URL**: Uploaded files can be accessed via `/uploads/{filename}`

## Response Format

The API response remains the same, but now includes the file path in `receipt_url`:

```json
{
  "id": 1,
  "title": "Office Supplies",
  "amount": 150.00,
  "description": "Purchased office supplies",
  "category": "Office",
  "receipt_url": "/uploads/receipt-1640995200000-123456789.jpg",
  "status_id": 1,
  "current_approval_level": 1,
  "requested_by": 1,
  "createdAt": "2023-12-31T12:00:00.000Z",
  "updatedAt": "2023-12-31T12:00:00.000Z",
  "Status": {
    "id": 1,
    "name": "PENDING"
  }
}
```

## Important Notes

1. **Content-Type**: Don't manually set the `Content-Type` header when using FormData. The browser will automatically set it to `multipart/form-data` with the correct boundary.

2. **File Optional**: The receipt file is optional. If no file is provided, the expense will be created with `receipt_url: null`.

3. **Authentication**: The Authorization header is still required for all requests.

4. **File Access**: To display uploaded receipts, use the full URL: `http://localhost:3000/uploads/{filename}`

5. **Error Handling**: The API will return appropriate error messages for invalid file types or files that exceed the size limit.

# Code Patterns Reference

Quick reference for implementing empty states and loading states consistently.

## Empty State Pattern

```typescript
import EmptyState from "./components/EmptyState";

// Simple empty state
if (items.length === 0) {
  return (
    <EmptyState
      title="No items yet"
      description="You haven't created any items yet. Start by adding your first one."
      actionText="Add your first item"
      actionHref="/items/new"
    />
  );
}

// Empty state without action
if (noData) {
  return (
    <EmptyState
      title="No data available"
      description="There is currently no data to display. This might be a configuration issue."
    />
  );
}
```

## Loading State Pattern

```typescript
import Loading from "./components/Loading";

// Full page loading
if (isLoading) {
  return <Loading text="Loading your data..." />;
}

// Inline loading
{isSubmitting ? (
  <Loading text="Saving..." />
) : (
  <YourForm />
)}
```

## Error State Pattern

```typescript
import ErrorMessage from "./components/ErrorMessage";

// Component state
const [error, setError] = useState<string>("");

// Show error
{error && <ErrorMessage message={error} />}

// Set error in catch block
try {
  await someAction();
} catch (err) {
  setError(err instanceof Error ? err.message : "Something went wrong");
}
```

## Button Loading Pattern

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleClick = async () => {
  setLoading(true);
  setError("");
  
  try {
    await someAsyncAction();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Action failed");
  } finally {
    setLoading(false);
  }
};

return (
  <>
    {error && <ErrorMessage message={error} />}
    <button 
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Loading..." : "Click Me"}
    </button>
  </>
);
```

## Multiple Buttons Loading Pattern

```typescript
const [loadingId, setLoadingId] = useState<string | null>(null);

const handleClick = async (id: string) => {
  setLoadingId(id);
  try {
    await someAsyncAction(id);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingId(null);
  }
};

return items.map(item => (
  <button
    key={item.id}
    onClick={() => handleClick(item.id)}
    disabled={loadingId !== null}
  >
    {loadingId === item.id ? "Loading..." : item.name}
  </button>
));
```

## Form Submission Pattern

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState("");

const handleSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  setError("");
  
  try {
    await submitData(data);
    // Success - maybe redirect or show success message
  } catch (err) {
    setError(err instanceof Error ? err.message : "Submission failed");
  } finally {
    setIsSubmitting(false);
  }
};

if (isSubmitting) {
  return <Loading text="Submitting form..." />;
}

return (
  <>
    {error && <ErrorMessage message={error} />}
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  </>
);
```

## Server Component Empty State Pattern

```typescript
// app/some-page/page.tsx
import EmptyState from "@/app/components/EmptyState";

export default async function SomePage() {
  const user = await getUser();
  
  if (!user) {
    return (
      <EmptyState
        title="Please log in"
        description="You need to be logged in to access this page."
        actionText="Go to login"
        actionHref="/login"
      />
    );
  }
  
  const data = await fetchData(user.id);
  
  if (data.length === 0) {
    return (
      <EmptyState
        title="No data found"
        description="You don't have any data yet."
        actionText="Create your first item"
        actionHref="/create"
      />
    );
  }
  
  return <DataDisplay data={data} />;
}
```

## CSS Classes Reference

```css
/* Empty states */
.empty-state { }

/* Loading */
.loading-container { }
.loading-spinner { }
.loading-text { }

/* Errors */
.error-message { }

/* Buttons */
button:disabled { }
button.loading { }
```

## Best Practices

1. **Always clear errors before new action**
   ```typescript
   setError("");
   ```

2. **Always set loading state**
   ```typescript
   setLoading(true);
   try { ... } finally { setLoading(false); }
   ```

3. **Handle errors gracefully**
   ```typescript
   catch (err) {
     setError(err instanceof Error ? err.message : "Something went wrong");
   }
   ```

4. **Disable during loading**
   ```typescript
   <button disabled={isLoading}>
   ```

5. **Show loading text**
   ```typescript
   {isLoading ? "Loading..." : "Normal text"}
   ```

6. **Use finally for cleanup**
   ```typescript
   finally {
     setLoading(false);
   }
   ```

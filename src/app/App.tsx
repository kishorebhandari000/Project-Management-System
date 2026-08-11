import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ConfirmProvider } from './hooks/useConfirm';
import { CommentPromptProvider } from './hooks/useCommentPrompt';

function App() {
  return (
    <ConfirmProvider>
      <CommentPromptProvider>
        <RouterProvider router={router} />
      </CommentPromptProvider>
    </ConfirmProvider>
  );
}

export default App;
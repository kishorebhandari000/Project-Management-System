import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ec7aca5b`;

interface AssessmentSubmittedParams {
  supervisorEmail: string;
  studentName: string;
  assessmentTitle: string;
  projectName?: string;
  submissionDate?: string;
  viewUrl?: string;
}

interface AssessmentGradedParams {
  studentEmail: string;
  studentName: string;
  assessmentTitle: string;
  marks: number;
  totalMarks: number;
  feedback?: string;
  viewUrl?: string;
}

interface SubmissionConfirmationParams {
  studentEmail: string;
  studentName: string;
  assessmentTitle: string;
  submissionDate?: string;
  viewUrl?: string;
}

interface DirectMessageParams {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderRole: string;
  subject: string;
  message: string;
  replyUrl?: string;
}

export async function notifyAssessmentSubmitted(params: AssessmentSubmittedParams) {
  try {
    const response = await fetch(`${SERVER_URL}/email/assessment-submitted`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(params),
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = 'Failed to send email';

      if (contentType?.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = `Server error: ${text.substring(0, 200)}`;
      }

      console.error('Failed to send assessment submission email:', errorMessage);
      throw new Error(errorMessage);
    }

    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error('Server returned non-JSON response:', text);
      throw new Error('Server is not deployed or not responding correctly. Please deploy the Supabase edge function.');
    }
  } catch (error) {
    console.error('Error notifying assessment submission:', error);
    throw error;
  }
}

export async function notifyAssessmentGraded(params: AssessmentGradedParams) {
  try {
    const response = await fetch(`${SERVER_URL}/email/assessment-graded`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(params),
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = 'Failed to send email';

      if (contentType?.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = `Server error: ${text.substring(0, 200)}`;
      }

      console.error('Failed to send assessment graded email:', errorMessage);
      throw new Error(errorMessage);
    }

    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error('Server returned non-JSON response:', text);
      throw new Error('Server is not deployed or not responding correctly. Please deploy the Supabase edge function.');
    }
  } catch (error) {
    console.error('Error notifying assessment graded:', error);
    throw error;
  }
}

export async function notifySubmissionConfirmation(params: SubmissionConfirmationParams) {
  try {
    const response = await fetch(`${SERVER_URL}/email/submission-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(params),
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = 'Failed to send email';

      if (contentType?.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = `Server error: ${text.substring(0, 200)}`;
      }

      console.error('Failed to send submission confirmation email:', errorMessage);
      throw new Error(errorMessage);
    }

    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error('Server returned non-JSON response:', text);
      throw new Error('Server is not deployed or not responding correctly. Please deploy the Supabase edge function.');
    }
  } catch (error) {
    console.error('Error sending submission confirmation:', error);
    throw error;
  }
}

export async function sendDirectMessage(params: DirectMessageParams) {
  try {
    const response = await fetch(`${SERVER_URL}/email/direct-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(params),
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = 'Failed to send email';

      if (contentType?.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = `Server error: ${text.substring(0, 200)}`;
      }

      console.error('Failed to send direct message email:', errorMessage);
      throw new Error(errorMessage);
    }

    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error('Server returned non-JSON response:', text);
      throw new Error('Server is not deployed or not responding correctly. Please deploy the Supabase edge function.');
    }
  } catch (error) {
    console.error('Error sending direct message:', error);
    throw error;
  }
}

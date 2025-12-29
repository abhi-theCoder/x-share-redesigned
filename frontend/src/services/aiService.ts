import api from '../api';

export const parseResumeWithAI = async (text: string) => {
    try {
        const response = await api.post('/api/ai/parse', { text });
        return response.data;
    } catch (error) {
        console.error('Error parsing resume with AI:', error);
        throw error;
    }
};

export const rewriteContentWithAI = async (text: string, context: string) => {
    try {
        const response = await api.post('/api/ai/rewrite', { text, context });
        return response.data.rewrittenText;
    } catch (error) {
        console.error('Error rewriting content with AI:', error);
        throw error;
    }
};

export const analyzeATSWithAI = async (resumeData: any) => {
    try {
        const response = await api.post('/api/ai/analyze-ats', { resumeData });
        return response.data;
    } catch (error) {
        console.error('Error analyzing ATS score with AI:', error);
        throw error;
    }
};

const { GoogleGenerativeAI } = require("@google/generative-ai");

const parseResume = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_PARSER_KEY || process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
      Extract professional resume information from the following text and return it as a structured JSON object.
      The JSON object MUST match this schema:
      {
        "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
        "summary": "",
        "experience": [{ "id": "exp1", "title": "", "company": "", "startDate": "", "endDate": "", "description": "" }],
        "education": [{ "id": "edu1", "degree": "", "institution": "", "city": "", "startDate": "", "endDate": "" }],
        "skills": [{ "id": "s1", "name": "", "level": "Expert|Intermediate|Beginner", "type": "Technical|Soft" }],
        "projects": [{ "id": "p1", "name": "", "role": "", "description": "", "url": "" }],
        "certifications": [{ "id": "c1", "name": "", "authority": "", "date": "" }],
        "achievements": [{ "id": "a1", "description": "" }],
        "interests": "",
        "languages": "",
        "references": ""
      }
      
      Resume Text:
      ${text}
      
      Return ONLY the JSON object. Do not include any markdown formatting like \`\`\`json.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonStr = response.text().trim();

        // Clean up potential markdown blocks if AI ignored the instruction
        const cleanedJson = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");

        const data = JSON.parse(cleanedJson);
        res.json(data);
    } catch (error) {
        console.error("AI Parse Error:", error);
        res.status(500).json({ error: "Failed to parse resume with AI" });
    }
};

const rewriteContent = async (req, res) => {
    try {
        const { text, context } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_REWRITE_KEY || process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
      As a professional resume writer, rewrite the following ${context || "content"} to be more impactful, 
      action-oriented, and professional. Use strong action verbs and highlight achievements.
      
      Original Text:
      ${text}
      
      Return ONLY the rewritten text.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ rewrittenText: response.text().trim() });
    } catch (error) {
        console.error("AI Rewrite Error:", error);
        res.status(500).json({ error: "Failed to rewrite content with AI" });
    }
};

const analyzeATS = async (req, res) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).json({ error: "No resume data provided" });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_ATS_KEY || process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
      Analyze the following resume data for ATS (Applicant Tracking System) compatibility and professional impact.
      Provide a score from 0 to 100, a list of strengths, and specific suggestions for improvement.
      Return the result as a JSON object:
      {
        "score": number,
        "strengths": [string],
        "improvements": [string],
        "summary": string
      }
      
      Resume Data:
      ${JSON.stringify(resumeData)}
      
      Return ONLY the JSON object.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonStr = response.text().trim();
        const cleanedJson = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");

        res.json(JSON.parse(cleanedJson));
    } catch (error) {
        console.error("AI ATS Analysis Error:", error);
        res.status(500).json({ error: "Failed to analyze ATS score with AI" });
    }
};

module.exports = {
    parseResume,
    rewriteContent,
    analyzeATS
};

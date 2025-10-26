import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Link, Font
} from '@react-pdf/renderer';

// --- Type Definitions (Ensuring compatibility with Resume Builder data) ---

interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  city: string;
  startDate: string;
  endDate: string;
  description?: string;
}

type SkillLevel = 'Beginner' | 'Intermediate' | 'Expert';
type SkillType = 'Technical' | 'Soft';

interface SkillItem {
  id: string;
  name: string;
  level: SkillLevel;
  type: SkillType;
}

interface ProjectItem {
    id: string;
    name: string;
    role: string;
    description: string; // Often a summary or bulleted list split by '\n'
    url: string;
}

interface AwardItem {
    id: string;
    name: string;
    issuer: string;
    date: string;
}

// Simplified config types for the template interface
interface SectionConfig { id: string; title: string; defaultEnabled: boolean; }
type SectionId = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'awards';

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  awards: AwardItem[];
}

interface TemplateElegantProps {
  data: ResumeData;
  sectionOrder: SectionId[];
  allSections: { [key in SectionId]: SectionConfig };
}

// --- Stylesheet for React-PDF ---

const ACCENT_COLOR = '#4A4A4A'; // Dark Gray/Black for elegance
const FONT_COLOR = '#333333';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: FONT_COLOR,
  },
  // --- Header ---
  header: {
    marginBottom: 20,
    borderBottom: `2pt solid ${ACCENT_COLOR}`,
    paddingBottom: 10,
    textAlign: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    color: FONT_COLOR,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    fontSize: 10,
  },
  contactItem: {
    marginHorizontal: 8,
    color: FONT_COLOR,
  },
  // --- Section Structure ---
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
    textTransform: 'uppercase',
    borderBottom: '1pt solid #cccccc',
    paddingBottom: 4,
    marginBottom: 8,
    marginTop: 10,
    fontFamily: 'Helvetica-Bold',
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  // --- Item Layout ---
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    marginTop: 5,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: FONT_COLOR,
    fontFamily: 'Helvetica-Bold',
  },
  itemSubtitle: {
    fontSize: 10,
    color: ACCENT_COLOR,
    fontFamily: 'Helvetica-Oblique',
  },
  itemDate: {
    fontSize: 10,
    color: '#666666',
    fontFamily: 'Helvetica-Oblique',
  },
  itemDescription: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 1.4,
  },
  // --- List Items / Bullets ---
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 8,
    fontSize: 8,
    lineHeight: 1.4,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },
  // --- Skills ---
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 5,
  },
  skillGroup: {
    flexDirection: 'row',
    marginBottom: 5,
    marginRight: 15,
  },
  skillName: {
      fontWeight: 'bold',
      marginRight: 5,
      fontFamily: 'Helvetica-Bold',
  },
  // Awards
  awardItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
  },
  awardName: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
  },
  awardIssuer: {
      fontSize: 10,
      color: '#666666',
  }
});

// --- Utility Components ---

const BulletPoint: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.bulletItem}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{text.trim()}</Text>
  </View>
);

const DescriptionBlock: React.FC<{ description: string }> = ({ description }) => {
    // Treat multiline descriptions as bullet points if they contain multiple lines/paragraphs
    const points = description.split('\n').filter(p => p.trim() !== '');

    if (points.length > 1) {
        return (
            <View style={{ marginTop: 4 }}>
                {points.map((point, index) => (
                    <BulletPoint key={index} text={point} />
                ))}
            </View>
        );
    }
    return <Text style={styles.itemDescription}>{description}</Text>;
}


// --- Template Implementation ---

const TemplateElegant: React.FC<TemplateElegantProps> = ({ data, sectionOrder, allSections }) => {
    
    // Renders the main content blocks based on the user's defined order and visibility
    const renderSection = (sectionId: SectionId) => {
        // Find the configuration for the section. Assumes sectionId is a key in allSections.
        const isEnabled = allSections[sectionId]?.defaultEnabled ?? true;

        if (!isEnabled || sectionId === 'personal') return null;

        switch (sectionId) {
            case 'summary':
                if (!data.summary) return null;
                return (
                    <View style={styles.section} key={sectionId}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.summaryText}>{data.summary}</Text>
                    </View>
                );

            case 'experience':
                if (data.experience.length === 0) return null;
                return (
                    <View style={styles.section} key={sectionId}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {data.experience.map((item) => (
                            <View key={item.id} style={{ marginBottom: 10 }}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    <Text style={styles.itemDate}>{item.startDate} - {item.endDate}</Text>
                                </View>
                                <Text style={styles.itemSubtitle}>{item.company}</Text>
                                <DescriptionBlock description={item.description} />
                            </View>
                        ))}
                    </View>
                );

            case 'education':
                if (data.education.length === 0) return null;
                return (
                    <View style={styles.section} key={sectionId}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {data.education.map((item) => (
                            <View key={item.id} style={{ marginBottom: 10 }}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{item.degree}</Text>
                                    <Text style={styles.itemDate}>{item.startDate} - {item.endDate}</Text>
                                </View>
                                <Text style={styles.itemSubtitle}>{item.institution}, {item.city}</Text>
                                {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
                            </View>
                        ))}
                    </View>
                );

            case 'skills':
                if (data.skills.length === 0) return null;

                const technicalSkills = data.skills.filter(s => s.type === 'Technical');
                const softSkills = data.skills.filter(s => s.type === 'Soft');

                return (
                    <View style={styles.section} key={sectionId}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillRow}>
                            {technicalSkills.length > 0 && (
                                <View style={styles.skillGroup}>
                                    <Text style={styles.skillName}>Technical:</Text>
                                    <Text>{technicalSkills.map(s => s.name).join(' | ')}</Text>
                                </View>
                            )}
                            {softSkills.length > 0 && (
                                <View style={styles.skillGroup}>
                                    <Text style={styles.skillName}>Soft:</Text>
                                    <Text>{softSkills.map(s => s.name).join(' | ')}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                );
            
            case 'projects':
                if (data.projects.length === 0) return null;
                return (
                    <View style={styles.section} key={sectionId}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {data.projects.map((item) => (
                            <View key={item.id} style={{ marginBottom: 10 }}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{item.name}</Text>
                                    {item.url && <Link src={item.url} style={styles.itemDate}>View Link</Link>}
                                </View>
                                <Text style={styles.itemSubtitle}>{item.role}</Text>
                                <DescriptionBlock description={item.description} />
                            </View>
                        ))}
                    </View>
                );

            case 'awards':
                if (data.awards.length === 0) return null;
                return (
                    <View style={styles.section} key={sectionId}>
                        <Text style={styles.sectionTitle}>Awards & Certifications</Text>
                        {data.awards.map((item) => (
                            <View key={item.id} style={styles.awardItem}>
                                <Text style={styles.awardName}>{item.name} / <Text style={styles.awardIssuer}>{item.issuer}</Text></Text>
                                <Text style={styles.itemDate}>{item.date}</Text>
                            </View>
                        ))}
                    </View>
                );

            default:
                return null;
        }
    };

    const contactDetails = [
        data.personal.email,
        data.personal.phone,
        data.personal.location,
    ].filter(Boolean);
    
    const socialLinks = [
        data.personal.linkedin && <Link key="li" src={`https://linkedin.com/in/${data.personal.linkedin}`} style={styles.contactItem}>LinkedIn</Link>,
        data.personal.github && <Link key="gh" src={`https://github.com/${data.personal.github}`} style={styles.contactItem}>GitHub</Link>,
        data.personal.portfolio && <Link key="port" src={data.personal.portfolio} style={styles.contactItem}>Portfolio</Link>,
    ].filter(Boolean);
    
    // Convert contact strings to Text components, separating them with a pipe
    const contactTexts = contactDetails.map((item, index) => (
        <React.Fragment key={`text-${index}`}>
            <Text style={styles.contactItem}>{item}</Text>
            {index < contactDetails.length - 1 && <Text style={styles.contactItem}> | </Text>}
        </React.Fragment>
    ));

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* --- Header / Personal Details --- */}
                <View style={styles.header}>
                    <Text style={styles.name}>{data.personal.name}</Text>
                    <Text style={styles.title}>{data.personal.title}</Text>
                    
                    <View style={styles.contactRow}>
                        {contactTexts}
                        {contactDetails.length > 0 && socialLinks.length > 0 && <Text style={styles.contactItem}> | </Text>}
                        {socialLinks.map((link, index) => (
                            <React.Fragment key={`link-${index}`}>
                                {link}
                                {index < socialLinks.length - 1 && <Text style={styles.contactItem}> | </Text>}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* --- Main Content Sections (Ordered by user) --- */}
                {sectionOrder.map((sectionId) => renderSection(sectionId))}

            </Page>
        </Document>
    );
};

export default TemplateElegant;
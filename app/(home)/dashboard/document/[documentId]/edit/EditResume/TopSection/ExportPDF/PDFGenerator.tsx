'use client';

import React from 'react';
import { Document, Font, Link, Page, PDFDownloadLink, StyleSheet, Text, View } from '@react-pdf/renderer';
import { ResumeDataType } from '@/types';
import { formatDateByLocale } from '@/lib/utils';

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Open Sans',
    fontSize: 11,
    paddingTop: 20,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    lineHeight: 1.5,
    flexDirection: 'column',
  },
  header: {
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 5,
    textAlign: 'center',
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 5,
    textAlign: 'center',
    color: '#333333',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
    fontSize: 10,
    color: '#555555',
    flexWrap: 'wrap',
  },
  contactItem: {
    marginHorizontal: 8,
  },
  contactLink: {
    color: '#555555',
    textDecoration: 'none',
  },
  separator: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectionContent: {
    marginBottom: 4,
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: 600,
  },
  experienceCompany: {
    fontSize: 11,
    color: '#555555',
  },
  experienceDate: {
    fontSize: 10,
    color: '#666666',
  },
  experienceDescription: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#333333',
  },
  educationItem: {
    marginBottom: 8,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  educationDegree: {
    fontSize: 12,
    fontWeight: 600,
  },
  educationSchool: {
    fontSize: 11,
    color: '#555555',
  },
  educationDate: {
    fontSize: 10,
    color: '#666666',
  },
  educationDescription: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    fontSize: 10,
    marginRight: 15,
    marginBottom: 3,
    color: '#333333',
  },
  projectItem: {
    marginBottom: 8,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  projectName: {
    fontSize: 12,
    fontWeight: 600,
  },
  projectLink: {
    fontSize: 10,
    color: '#0066cc',
    textDecoration: 'none',
  },
  projectDescription: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },
  languageItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  languageName: {
    fontSize: 10,
    marginRight: 8,
    fontWeight: 600,
  },
  languageLevel: {
    fontSize: 10,
    color: '#555555',
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
  },
  bulletList: {
    marginLeft: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },
});

const parseHTML = (html: string) => {
  if (!html) return '';

  const cleanText = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleanText;
};

const ResumePDF = ({ resumeInfo, pagesOrder }: { resumeInfo: ResumeDataType; pagesOrder: string[] }) => {
  const themeColor = resumeInfo?.themeColor || '#000000';
  const isCompact = resumeInfo?.personalInfoDisplayFormat === 'compact';

  const normalizeUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const renderPersonalInfo = () => {
    const info = resumeInfo?.personalInfo;
    if (!info) return null;

    if (isCompact) {
      const compactItems = [];
      if (info.jobTitle) compactItems.push(info.jobTitle);
      if (info.address) compactItems.push(info.address);
      if (info.phone) compactItems.push(info.phone);
      if (info.email) compactItems.push(info.email);
      if (info.github) compactItems.push(info.github.replace(/^https?:\/\//, ''));
      if (info.linkedin) compactItems.push(info.linkedin.replace(/^https?:\/\//, ''));

      return (
        <View style={styles.header}>
          <Text style={[styles.name, { color: themeColor }]}>
            {info.firstName || 'First Name'} {info.lastName || 'Last Name'}
          </Text>
          <View style={styles.contactInfo}>
            {compactItems.map((item, index) => (
              <React.Fragment key={`compact-${index}`}>
                <Text style={styles.contactItem}>{item}</Text>
                {index < compactItems.length - 1 && <Text style={[styles.contactItem, { color: themeColor }]}>|</Text>}
              </React.Fragment>
            ))}
          </View>
          <View style={[styles.separator, { borderBottomColor: themeColor }]} />
        </View>
      );
    }

    return (
      <View style={styles.header}>
        <Text style={[styles.name, { color: themeColor }]}>
          {info.firstName || 'First Name'} {info.lastName || 'Last Name'}
        </Text>
        <Text style={styles.jobTitle}>{info.jobTitle || 'Job Title'}</Text>
        <View style={styles.contactInfo}>
          {info.address && <Text style={styles.contactItem}>{info.address}</Text>}
          {info.phone && <Text style={styles.contactItem}>{info.phone}</Text>}
          {info.email && (
            <Link style={[styles.contactItem, styles.contactLink]} src={`mailto:${info.email}`}>
              {info.email}
            </Link>
          )}
        </View>
        <View style={styles.contactInfo}>
          {info.github && (
            <Link style={[styles.contactItem, styles.contactLink]} src={normalizeUrl(info.github)}>
              {info.github.replace(/^https?:\/\//, '')}
            </Link>
          )}
          {info.linkedin && (
            <Link style={[styles.contactItem, styles.contactLink]} src={normalizeUrl(info.linkedin)}>
              {info.linkedin.replace(/^https?:\/\//, '')}
            </Link>
          )}
        </View>
        <View style={[styles.separator, { borderBottomColor: themeColor }]} />
      </View>
    );
  };

  const renderSummary = () => {
    if (!resumeInfo?.summary) return null;
    const summaryText = parseHTML(resumeInfo.summary);

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColor }]}>PROFESSIONAL SUMMARY</Text>
        <Text style={styles.summary}>{summaryText}</Text>
      </View>
    );
  };

  const renderExperience = () => {
    if (!resumeInfo?.experiences || resumeInfo.experiences.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColor }]}>WORK EXPERIENCE</Text>
        {resumeInfo.experiences.map((exp, index) => {
          const workSummary = parseHTML(exp.workSummary || '');
          const startDate =
            exp.yearsOnly && exp.startDate
              ? new Date(exp.startDate).getFullYear().toString()
              : exp.startDate
                ? formatDateByLocale(exp.startDate)
                : '';
          const endDate = exp.currentlyWorking
            ? 'Present'
            : exp.yearsOnly && exp.endDate
              ? new Date(exp.endDate).getFullYear().toString()
              : exp.endDate
                ? formatDateByLocale(exp.endDate)
                : '';

          return (
            <View key={`experience-${index}`} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.experienceTitle}>{exp.title || 'Position Title'}</Text>
                  <Text style={styles.experienceCompany}>
                    {exp.companyName || 'Company Name'}
                    {(exp.city || exp.state) && ' • '}
                    {exp.city && `${exp.city}`}
                    {exp.city && exp.state && ', '}
                    {exp.state}
                  </Text>
                </View>
                <Text style={styles.experienceDate}>{startDate && endDate ? `${startDate} - ${endDate}` : ''}</Text>
              </View>
              <Text style={styles.experienceDescription}>{workSummary}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderEducation = () => {
    if (!resumeInfo?.educations || resumeInfo.educations.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColor }]}>EDUCATION</Text>
        {resumeInfo.educations.map((edu, index) => {
          const description = parseHTML(edu.description || '');
          let dateText = '';

          if (!edu.hideDates && !edu.skipDates) {
            const startDate =
              edu.yearsOnly && edu.startDate
                ? new Date(edu.startDate).getFullYear().toString()
                : edu.startDate
                  ? formatDateByLocale(edu.startDate)
                  : '';
            const endDate = edu.currentlyStudying
              ? 'Present'
              : edu.yearsOnly && edu.endDate
                ? new Date(edu.endDate).getFullYear().toString()
                : edu.endDate
                  ? formatDateByLocale(edu.endDate)
                  : '';
            dateText = startDate && endDate ? `${startDate} - ${endDate}` : '';
          }

          return (
            <View key={`education-${index}`} style={styles.educationItem}>
              <View style={styles.educationHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.educationDegree}>
                    {edu.degree || 'Degree'} {edu.major && `in ${edu.major}`}
                  </Text>
                  <Text style={styles.educationSchool}>{edu.universityName || 'University Name'}</Text>
                </View>
                {dateText && <Text style={styles.educationDate}>{dateText}</Text>}
              </View>
              {description && <Text style={styles.educationDescription}>{description}</Text>}
            </View>
          );
        })}
      </View>
    );
  };

  const renderSkills = () => {
    if (!resumeInfo?.skills || resumeInfo.skills.length === 0) return null;

    const displayFormat = resumeInfo?.skillsDisplayFormat || 'default';

    if (displayFormat === 'grouped') {
      const groupedSkills = resumeInfo.skills.reduce(
        (acc, skill) => {
          const category = skill.category || 'Other';
          if (!acc[category]) acc[category] = [];
          acc[category].push(skill);
          return acc;
        },
        {} as Record<string, typeof resumeInfo.skills>
      );

      return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColor }]}>SKILLS</Text>
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <View key={category} style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{category}:</Text>
              <View style={styles.skillsContainer}>
                {skills.map((skill, index) => (
                  <Text key={`skill-${category}-${index}`} style={styles.skillItem}>
                    {skill.name}
                    {index < skills.length - 1 && ' • '}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColor }]}>SKILLS</Text>
        <View style={styles.skillsContainer}>
          {resumeInfo.skills.map((skill, index) => (
            <Text key={`skill-${index}`} style={styles.skillItem}>
              {skill.name}
              {index < resumeInfo.skills!.length - 1 && ' • '}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderProjects = () => {
    if (!resumeInfo?.projects || resumeInfo.projects.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColor }]}>
          {resumeInfo.projectsSectionTitle || 'PROJECTS'}
        </Text>
        {resumeInfo.projects.map((project, index) => {
          const description = parseHTML(project.description || '');

          return (
            <View key={`project-${index}`} style={styles.projectItem}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                {project.url && (
                  <Link style={styles.projectLink} src={normalizeUrl(project.url)}>
                    {project.url.replace(/^https?:\/\//, '')}
                  </Link>
                )}
              </View>
              {description && <Text style={styles.projectDescription}>{description}</Text>}
            </View>
          );
        })}
      </View>
    );
  };

  const renderLanguages = () => {
    if (!resumeInfo?.languages || resumeInfo.languages.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColor }]}>
          {resumeInfo.languagesSectionTitle || 'LANGUAGES'}
        </Text>
        {resumeInfo.languages.map((language, index) => (
          <View key={`language-${index}`} style={styles.languageItem}>
            <Text style={styles.languageName}>{language.name}</Text>
            {language.level && <Text style={styles.languageLevel}>- {language.level}</Text>}
          </View>
        ))}
      </View>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactElement | null> = {
    'personal-info': renderPersonalInfo,
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    projects: renderProjects,
    skills: renderSkills,
    languages: renderLanguages,
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {pagesOrder.map((section, index) => {
          const renderer = sectionRenderers[section];
          const content = renderer ? renderer() : null;
          return content ? <View key={`section-${section}-${index}`}>{content}</View> : null;
        })}
      </Page>
    </Document>
  );
};

export const PDFGenerator = ({
  resumeInfo,
  pagesOrder,
  fileName,
  children,
}: {
  resumeInfo: ResumeDataType;
  pagesOrder: string[];
  fileName: string;
  children: React.ReactNode;
}) => {
  return (
    <PDFDownloadLink document={<ResumePDF resumeInfo={resumeInfo} pagesOrder={pagesOrder} />} fileName={fileName}>
      {({ loading }) => (loading ? <>{children}</> : <>{children}</>)}
    </PDFDownloadLink>
  );
};

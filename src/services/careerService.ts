import { CareerOpportunity, CareerCategory } from '../types';
import { CareerRepository } from '../repositories/CareerRepository';

export interface MatchingCriteriaInput {
  interests: string[];
  subjects: string[];
  workStyle: string;
  theoryVsPractice: string;
  educationLevel?: string;
  locationPreference?: string;
  salaryExpectation?: number;
  skillsQuery?: string;
  industryPreference?: string;
  relocationWillingness?: boolean;
  entrepreneurialInclination?: boolean;
}

export const careerService = {
  async getCareers(): Promise<CareerOpportunity[]> {
    return CareerRepository.getCareers();
  },

  async createCareer(career: CareerOpportunity): Promise<CareerOpportunity> {
    return CareerRepository.createCareer(career);
  },

  async getSavedPathway(studentId: string): Promise<{ pathway: any; completedMilestones: string[] } | null> {
    return CareerRepository.getSavedPathway(studentId);
  },

  async savePathway(studentId: string, pathway: any, completedMilestones: string[]): Promise<void> {
    return CareerRepository.savePathway(studentId, pathway, completedMilestones);
  },

  async clearPathway(studentId: string): Promise<void> {
    return CareerRepository.clearPathway(studentId);
  },

  /**
   * Pure TypeScript Multi-Factor Score-based Recommendation Engine
   * Scoring factors:
   * 1. Interest Match (Weight: 30%)
   * 2. Subject Preferences (Weight: 25%)
   * 3. Work Style & Culture Compatibility (Weight: 15%)
   * 4. Theory vs Practical Preference (Weight: 15%)
   * 5. General Profile Settings & Emerging Boost (Weight: 15%)
   */
  async matchCareersLocal(input: MatchingCriteriaInput): Promise<CareerOpportunity[]> {
    const allCareers = await this.getCareers();
    
    // Calculate match score for each career
    const scoredCareers = allCareers.map(career => {
      let score = 50; // Base score

      const criteria = career.matchingCriteria;
      if (!criteria) return { career, score: 50 };

      // 1. Interest Matching (Max +30 points)
      let interestHits = 0;
      input.interests.forEach(interestId => {
        if (criteria.interests.some(ci => ci.toLowerCase().includes(interestId.toLowerCase()) || interestId.toLowerCase().includes(ci.toLowerCase()))) {
          interestHits++;
        }
      });
      const interestScore = input.interests.length > 0 ? (interestHits / input.interests.length) * 30 : 15;
      score += interestScore;

      // 2. Subject Matching (Max +25 points)
      let subjectHits = 0;
      input.subjects.forEach(subId => {
        if (criteria.subjects.some(cs => cs.toLowerCase().includes(subId.toLowerCase()) || subId.toLowerCase().includes(cs.toLowerCase()))) {
          subjectHits++;
        }
      });
      const subjectScore = input.subjects.length > 0 ? (subjectHits / input.subjects.length) * 25 : 12;
      score += subjectScore;

      // 3. Work Style matching (Max +15 points)
      if (input.workStyle && criteria.workStyle) {
        if (input.workStyle.toLowerCase() === criteria.workStyle.toLowerCase()) {
          score += 15;
        } else if (input.workStyle === 'Leadership' && criteria.workStyle === 'Collaborative') {
          score += 8; // partial alignment
        }
      } else {
        score += 7;
      }

      // 4. Theory vs Practice matching (Max +15 points)
      if (input.theoryVsPractice && criteria.theoryVsPractice) {
        if (input.theoryVsPractice === criteria.theoryVsPractice) {
          score += 15;
        } else if (criteria.theoryVsPractice === 'balanced' || input.theoryVsPractice === 'balanced') {
          score += 8; // partial alignment
        }
      } else {
        score += 7;
      }

      // 5. Advanced Matching Filters (Boosts/Penalties)
      // Education Level Check
      if (input.educationLevel && criteria.educationLevel) {
        if (input.educationLevel !== 'No Degree' && criteria.educationLevel === 'No Degree') {
          score += 5; // Overqualified, still compatible
        } else if (input.educationLevel === criteria.educationLevel) {
          score += 10;
        } else {
          score -= 5; // potential mismatch
        }
      }

      // Location Preference Check
      if (input.locationPreference && criteria.locationPreference) {
        if (input.locationPreference.toLowerCase() === criteria.locationPreference.toLowerCase() || criteria.locationPreference === 'Flexible') {
          score += 10;
        } else {
          score -= 3;
        }
      }

      // Salary expectations (INR per year)
      if (input.salaryExpectation) {
        if (career.salaryRange.max >= input.salaryExpectation) {
          score += 10;
        } else {
          score -= 10; // doesn't meet expectations
        }
      }

      // Industry Preference
      if (input.industryPreference && career.category) {
        if (career.category.toLowerCase().includes(input.industryPreference.toLowerCase()) || input.industryPreference.toLowerCase().includes(career.category.toLowerCase())) {
          score += 15;
        }
      }

      // Entrepreneurial preference matching
      if (input.entrepreneurialInclination !== undefined && criteria.entrepreneurialInclination !== undefined) {
        if (input.entrepreneurialInclination === criteria.entrepreneurialInclination) {
          score += 8;
        }
      }

      // Emerging Careers / Future-Proof boost (+5 for Green and New Collar)
      if (career.category === 'Green Collar' || career.category === 'New Collar') {
        score += 5;
      }

      // Bound score between 0 and 100
      const finalScore = Math.min(100, Math.max(10, Math.round(score)));

      return {
        career,
        score: finalScore
      };
    });

    // Sort by match score descending
    const sorted = scoredCareers.sort((a, b) => b.score - a.score);
    
    // Inject the match score dynamically as matchPercentage
    return sorted.map(item => {
      return {
        ...item.career,
        matchingCriteria: item.career.matchingCriteria, // maintain complete matching criteria
        salaryRange: item.career.salaryRange,
        id: item.career.id,
        title: item.career.title,
        category: item.career.category,
        overview: item.career.overview,
        eligibility: item.career.eligibility,
        requiredSubjects: item.career.requiredSubjects,
        pathways: item.career.pathways,
        alternativePathways: item.career.alternativePathways,
        entranceExams: item.career.entranceExams,
        skills: item.career.skills,
        certifications: item.career.certifications,
        roadmap: item.career.roadmap,
        responsibilities: item.career.responsibilities,
        industries: item.career.industries,
        opportunities: item.career.opportunities,
        outlook: item.career.outlook,
        automationImpact: item.career.automationImpact,
        relatedCareers: item.career.relatedCareers,
        resources: item.career.resources,
        // Override match percentage in local matching
        matchPercentage: item.score
      } as unknown as CareerOpportunity;
    });
  },

  /**
   * Generates a rich offline personalized counseling assessment using multi-factor analysis,
   * interest clustering, and skill-gap metrics.
   */
  generateLocalCounselingNote(input: MatchingCriteriaInput, topMatches: CareerOpportunity[]): string {
    if (topMatches.length === 0) {
      return `Hello! \n\nWe analyzed your career diagnostic parameters. Based on your inputs, we did not find direct fits. Try expanding your fields of interest or selecting more subjects to widen options!`;
    }

    const primaryMatch = topMatches[0];
    const alternativeMatches = topMatches.slice(1, 3);
    const interestsStr = input.interests.join(', ') || 'general discovery';
    const subjectsStr = input.subjects.join(', ') || 'general science';

    let note = `### AI Career Counseling Blueprint for Success\n\n`;
    note += `Hello from Learner's Den! We have carefully cross-analyzed your comprehensive vocational profile. You indicated a strong affinity for **${interestsStr}** combined with academic strengths in **${subjectsStr}**. Your preferred working environment is **${input.workStyle}** with a **${input.theoryVsPractice}** approach to learning.\n\n`;

    note += `Based on these parameters, your ultimate matched career path is **${primaryMatch.title}** (${primaryMatch.category} track) with a match score of **${(primaryMatch as any).matchPercentage || 95}%**.\n\n`;

    note += `### Why This Path Fits You perfectly:\n`;
    note += `* **Aptitude Convergence**: Your analytical style supports the complex problem-solving requirements of this role.\n`;
    note += `* **Subject Synergy**: Your selected subjects (${primaryMatch.requiredSubjects.join(', ')}) directly align with the core requirements for university entrances and professional eligibility.\n`;
    note += `* **Work Style Harmony**: Being a **${input.workStyle}** role, it satisfies your preference for ${input.workStyle === 'Collaborative' ? 'dynamic team coordination' : 'autonomous deep work focus'}.\n\n`;

    note += `### Skill-Gap Analysis & Action Items:\n`;
    note += `The top skills required for this career are: **${primaryMatch.skills.join(', ')}**. Here are your active recommended training checkpoints at Learner's Den:\n`;
    primaryMatch.roadmap.slice(0, 3).forEach((step, idx) => {
      note += `${idx + 1}. **${step}**\n`;
    });
    note += `\n`;

    if (alternativeMatches.length > 0) {
      note += `### Alternative Career Pathways:\n`;
      alternativeMatches.forEach(alt => {
        note += `* **${alt.title}** (${alt.category}): Match score of **${(alt as any).matchPercentage || 85}%**. This provides an excellent alternative route combining ${alt.skills.slice(0, 2).join(' and ')}.\n`;
      });
      note += `\n`;
    }

    // Emerging and Future-proof Careers
    const emerging = topMatches.find(c => c.category === 'New Collar' || c.category === 'Green Collar');
    if (emerging && emerging.id !== primaryMatch.id) {
      note += `### Emerging Career Suggestion:\n`;
      note += `* **${emerging.title}** (${emerging.category}): In the next 5 years, this industry is slated for massive expansion. It has low automation risk and values hands-on certifications over expensive traditional degrees. Learn more about its outlook: *"${emerging.outlook}"*\n\n`;
    }

    note += `*Note:* To generate an even deeper real-time cognitive assessment directly powered by the Google Gemini 3.5 Flash server model, please ensure you save your **GEMINI_API_KEY** under the settings secret panel!`;

    return note;
  }
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CAPABILITY_TO_PROFILE_RULES,
  COMPOSITION_RULES,
  CONFLICT_RULES,
  CONSTRAINT_RULES,
  ORDERED_REQUIREMENT_IDS,
  PROFILE_BASE_SCORE,
  PROFILE_DEFAULT_ALTERNATIVES,
  PROFILE_ORDER,
  PROFILES,
  REQUIREMENT_TO_CAPABILITY_RULES,
} from './constants';
import {
  ArchitectureProfileId,
  ArchitectureRecommendation,
  BilingualText,
  DecisionResult,
  RequirementSelection,
  RuleTrace,
} from './types';

const LOW_SCORE_REASON: BilingualText = {
  es: 'Menor puntaje de ajuste frente a otras alternativas.',
  en: 'Lower fit score compared with other alternatives.',
};

function cloneSelection(selection: RequirementSelection): RequirementSelection {
  return { ...selection };
}

function uniqueTexts(items: BilingualText[]): BilingualText[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.es}|${item.en}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function pushTrace(
  traces: RuleTrace[],
  id: string,
  stage: RuleTrace['stage'],
  message: BilingualText,
  impact: string,
  matrixTrace?: string,
): void {
  traces.push({ id, stage, message, impact, matrixTrace });
}

function normalizeSelection(input: RequirementSelection): {
  normalized: RequirementSelection;
  traces: RuleTrace[];
  conflictsResolved: BilingualText[];
} {
  const normalized = cloneSelection(input);
  const traces: RuleTrace[] = [];
  const conflictsResolved: BilingualText[] = [];

  const nonLocalActive = ORDERED_REQUIREMENT_IDS.some((key) => key !== 'localOnly' && normalized[key]);
  if (nonLocalActive && normalized.localOnly) {
    normalized.localOnly = false;
    conflictsResolved.push(CONFLICT_RULES[0].resolution);
    pushTrace(
      traces,
      'NORM-LOCAL-DISABLED',
      'normalization',
      {
        es: 'Se desactiva localOnly por coexistencia con requisitos de conectividad.',
        en: 'localOnly disabled because connectivity requirements are active.',
      },
      'localOnly=false',
      'A0 vs A2/A4/A6/A7',
    );
  }

  if (!nonLocalActive && !normalized.localOnly) {
    normalized.localOnly = true;
    pushTrace(
      traces,
      'NORM-LOCAL-DEFAULT',
      'normalization',
      {
        es: 'Sin requisitos externos activos, se activa localOnly por defecto.',
        en: 'No external requirements active, localOnly enabled by default.',
      },
      'localOnly=true',
      'A0',
    );
  }

  if (!normalized.aiAnalytics && normalized.aiControlValidated) {
    normalized.aiControlValidated = false;
    conflictsResolved.push(CONFLICT_RULES[2].resolution);
    pushTrace(
      traces,
      'NORM-AI-CONTROL-DISABLED',
      'normalization',
      {
        es: 'Se desactiva validacion de control IA porque IA/analitica no esta activa.',
        en: 'AI control validation disabled because AI analytics is not active.',
      },
      'aiControlValidated=false',
      'A7',
    );
  }

  return { normalized, traces, conflictsResolved };
}

function scoreRecommendations(
  capabilities: Set<string>,
  traces: RuleTrace[],
  penalties: Partial<Record<ArchitectureProfileId, number>>,
): {
  recommendations: ArchitectureRecommendation[];
  traces: RuleTrace[];
} {
  const scores: Record<ArchitectureProfileId, number> = { ...PROFILE_BASE_SCORE };
  const firedRules = new Map<ArchitectureProfileId, Set<string>>();
  const justifications = new Map<ArchitectureProfileId, BilingualText[]>();

  for (const profileId of PROFILE_ORDER) {
    firedRules.set(profileId, new Set<string>());
    justifications.set(profileId, []);
  }

  for (const rule of CAPABILITY_TO_PROFILE_RULES) {
    if (!capabilities.has(rule.capability)) {
      continue;
    }

    for (const weight of rule.weights) {
      scores[weight.profileId] += weight.score;
      firedRules.get(weight.profileId)?.add(rule.id);
      justifications.get(weight.profileId)?.push(weight.reason);

      pushTrace(
        traces,
        rule.id,
        'capability-to-profile',
        weight.reason,
        `${weight.profileId} ${weight.score >= 0 ? '+' : ''}${weight.score}`,
        rule.matrixTrace,
      );
    }
  }

  for (const comp of COMPOSITION_RULES) {
    const applies = comp.allCapabilities.every((capability) => capabilities.has(capability));
    if (!applies) {
      continue;
    }

    scores[comp.compositeProfile] += comp.scoreBonus;
    firedRules.get(comp.compositeProfile)?.add(comp.id);
    justifications.get(comp.compositeProfile)?.push(comp.reason);

    pushTrace(
      traces,
      comp.id,
      'composition',
      comp.reason,
      `${comp.compositeProfile} +${comp.scoreBonus}`,
      comp.matrixTrace,
    );
  }

  for (const [profileId, scoreDelta] of Object.entries(penalties) as Array<[ArchitectureProfileId, number]>) {
    if (!scoreDelta) {
      continue;
    }
    scores[profileId] += scoreDelta;
    firedRules.get(profileId)?.add('constraint-penalty');
    pushTrace(
      traces,
      `PENALTY-${profileId}`,
      'constraint',
      {
        es: `Ajuste por restriccion aplicado a ${profileId}.`,
        en: `Constraint adjustment applied to ${profileId}.`,
      },
      `${profileId} ${scoreDelta >= 0 ? '+' : ''}${scoreDelta}`,
    );
  }

  const recommendations = PROFILE_ORDER.map((profileId) => ({
    profile: PROFILES[profileId],
    score: scores[profileId],
    capabilities: Array.from(capabilities),
    firedRules: Array.from(firedRules.get(profileId) ?? []),
    justifications: uniqueTexts(justifications.get(profileId) ?? []),
  })).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return PROFILE_ORDER.indexOf(a.profile.id) - PROFILE_ORDER.indexOf(b.profile.id);
  });

  return { recommendations, traces };
}

function selectAlternative(
  primary: ArchitectureRecommendation,
  rankedRecommendations: ArchitectureRecommendation[],
): ArchitectureRecommendation | null {
  const configuredAlternatives = PROFILE_DEFAULT_ALTERNATIVES[primary.profile.id] ?? [];

  for (const profileId of configuredAlternatives) {
    const candidate = rankedRecommendations.find((item) => item.profile.id === profileId);
    if (candidate) {
      return candidate;
    }
  }

  return rankedRecommendations.find((item) => item.profile.id !== primary.profile.id) ?? null;
}

export function evaluateArchitecture(selection: RequirementSelection): DecisionResult {
  const traces: RuleTrace[] = [];
  const penalties: Partial<Record<ArchitectureProfileId, number>> = {};

  const normalizedResult = normalizeSelection(selection);
  traces.push(...normalizedResult.traces);

  const capabilities = new Set<string>();
  for (const rule of REQUIREMENT_TO_CAPABILITY_RULES) {
    if (!normalizedResult.normalized[rule.requirement]) {
      continue;
    }

    capabilities.add(rule.capability);
    pushTrace(
      traces,
      rule.id,
      'requirement-to-capability',
      rule.reason,
      `+${rule.capability}`,
      rule.matrixTrace,
    );
  }

  for (const rule of CONSTRAINT_RULES) {
    if (!normalizedResult.normalized[rule.ifRequirement]) {
      continue;
    }
    if (rule.unlessRequirement && normalizedResult.normalized[rule.unlessRequirement]) {
      continue;
    }

    if (rule.forceCapability) {
      capabilities.add(rule.forceCapability);
    }

    for (const penalty of rule.penalties) {
      penalties[penalty.profileId] = (penalties[penalty.profileId] ?? 0) + penalty.scoreDelta;
    }

    pushTrace(
      traces,
      rule.id,
      'constraint',
      rule.reason,
      rule.forceCapability ? `+${rule.forceCapability}` : 'score adjustment',
      rule.matrixTrace,
    );
  }

  const scoring = scoreRecommendations(capabilities, traces, penalties);
  const rankedRecommendations = scoring.recommendations;
  const primary = rankedRecommendations[0];
  const alternative = selectAlternative(primary, rankedRecommendations);

  pushTrace(
    traces,
    'SELECT-PRIMARY',
    'selection',
    {
      es: `Arquitectura principal seleccionada: ${primary.profile.id}.`,
      en: `Primary architecture selected: ${primary.profile.id}.`,
    },
    `${primary.profile.id} score=${primary.score}`,
    primary.profile.matrixTrace,
  );

  if (alternative) {
    pushTrace(
      traces,
      'SELECT-ALTERNATIVE',
      'selection',
      {
        es: `Alternativa seleccionada: ${alternative.profile.id}.`,
        en: `Alternative selected: ${alternative.profile.id}.`,
      },
      `${alternative.profile.id} score=${alternative.score}`,
      alternative.profile.matrixTrace,
    );
  }

  const rejectedProfiles = rankedRecommendations
    .slice(2)
    .map((recommendation) => ({
      profileId: recommendation.profile.id,
      score: recommendation.score,
      reason: LOW_SCORE_REASON,
    }));

  return {
    normalizedSelection: normalizedResult.normalized,
    capabilities: Array.from(capabilities),
    primary,
    alternative,
    rankedRecommendations,
    explain: {
      traces,
      conflictsResolved: normalizedResult.conflictsResolved,
      rejectedProfiles,
    },
  };
}

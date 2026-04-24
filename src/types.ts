/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'es' | 'en';

export interface BilingualText {
  es: string;
  en: string;
}

export type RequirementGroupId = 'operational' | 'data' | 'integration' | 'advanced';

export type RequirementId =
  | 'localOnly'
  | 'remoteProgramming'
  | 'remoteMaintenance'
  | 'thirdPartyAccess'
  | 'telemetry'
  | 'reporting'
  | 'cloudIntegration'
  | 'erpScadaIntegration'
  | 'aiAnalytics'
  | 'aiControlValidated';

export type ArchitectureProfileId =
  | 'A0'
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'A6'
  | 'A7'
  | 'A2+A4';

export type ProfileKind = 'base' | 'composite';
export type RelativeLevel = 'Low' | 'Medium' | 'High';

export interface RequirementOption {
  id: RequirementId;
  group: RequirementGroupId;
  label: BilingualText;
  description: BilingualText;
  tooltip: BilingualText;
  matrixTrace: string;
}

export type RequirementSelection = Record<RequirementId, boolean>;

export interface LayerComponents {
  ot: string[];
  edge: string[];
  integration?: string[];
  data: string[];
  security: string[];
}

export interface BaselineByLayer {
  minimum: LayerComponents;
  reinforced: LayerComponents;
}

export interface TradeOffModel {
  benefits: BilingualText[];
  risks: BilingualText[];
  complexity: RelativeLevel;
  relativeCost: RelativeLevel;
  operationalLoad: RelativeLevel;
}

export interface ArchitectureProfileDefinition {
  id: ArchitectureProfileId;
  kind: ProfileKind;
  title: BilingualText;
  summary: BilingualText;
  keyRule: BilingualText;
  mainRisk: BilingualText;
  oemReference?: string;
  matrixTrace: string;
  layers: LayerComponents;
  baseline: BaselineByLayer;
  tradeOffs: TradeOffModel;
  blueprint: BilingualText;
  executiveSummary: BilingualText;
}

export interface RequirementToCapabilityRule {
  id: string;
  requirement: RequirementId;
  capability: string;
  reason: BilingualText;
  matrixTrace: string;
}

export interface CapabilityWeight {
  profileId: ArchitectureProfileId;
  score: number;
  reason: BilingualText;
}

export interface CapabilityToProfileRule {
  id: string;
  capability: string;
  weights: CapabilityWeight[];
  matrixTrace: string;
}

export interface CompositionRule {
  id: string;
  allCapabilities: string[];
  compositeProfile: ArchitectureProfileId;
  scoreBonus: number;
  reason: BilingualText;
  matrixTrace: string;
}

export interface ConstraintRule {
  id: string;
  ifRequirement: RequirementId;
  unlessRequirement?: RequirementId;
  forceCapability?: string;
  penalties: Array<{ profileId: ArchitectureProfileId; scoreDelta: number }>;
  reason: BilingualText;
  matrixTrace: string;
}

export interface ConflictRule {
  id: string;
  requirements: RequirementId[];
  message: BilingualText;
  resolution: BilingualText;
  matrixTrace: string;
}

export type DecisionStage =
  | 'normalization'
  | 'requirement-to-capability'
  | 'capability-to-profile'
  | 'composition'
  | 'constraint'
  | 'conflict'
  | 'selection';

export interface RuleTrace {
  id: string;
  stage: DecisionStage;
  message: BilingualText;
  impact: string;
  matrixTrace?: string;
}

export interface ArchitectureRecommendation {
  profile: ArchitectureProfileDefinition;
  score: number;
  capabilities: string[];
  firedRules: string[];
  justifications: BilingualText[];
}

export interface RejectedProfile {
  profileId: ArchitectureProfileId;
  score: number;
  reason: BilingualText;
}

export interface ExplainDecision {
  traces: RuleTrace[];
  conflictsResolved: BilingualText[];
  rejectedProfiles: RejectedProfile[];
}

export interface DecisionResult {
  normalizedSelection: RequirementSelection;
  capabilities: string[];
  primary: ArchitectureRecommendation;
  alternative: ArchitectureRecommendation | null;
  rankedRecommendations: ArchitectureRecommendation[];
  explain: ExplainDecision;
}

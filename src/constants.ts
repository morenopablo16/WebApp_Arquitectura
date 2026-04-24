/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ArchitectureProfileDefinition,
  ArchitectureProfileId,
  CapabilityToProfileRule,
  CompositionRule,
  ConflictRule,
  ConstraintRule,
  RequirementId,
  RequirementOption,
  RequirementSelection,
  RequirementToCapabilityRule,
} from './types';

export const REQUIREMENT_GROUP_LABELS = {
  operational: { es: 'Operational', en: 'Operational' },
  data: { es: 'Data', en: 'Data' },
  integration: { es: 'Integration', en: 'Integration' },
  advanced: { es: 'Advanced', en: 'Advanced' },
} as const;

export const DEFAULT_SELECTION: RequirementSelection = {
  localOnly: true,
  remoteProgramming: false,
  remoteMaintenance: false,
  thirdPartyAccess: false,
  telemetry: false,
  reporting: false,
  cloudIntegration: false,
  erpScadaIntegration: false,
  aiAnalytics: false,
  aiControlValidated: false,
};

export const REQUIREMENT_OPTIONS: RequirementOption[] = [
  {
    id: 'localOnly',
    group: 'operational',
    label: { es: 'Operacion local aislada', en: 'Local isolated operation' },
    description: {
      es: 'La maquina opera sin conectividad externa.',
      en: 'Machine runs without external connectivity.',
    },
    tooltip: {
      es: 'Matriz CIBMAQ A0: sin router, sin VPN y sin cloud.',
      en: 'CIBMAQ matrix A0: no router, no VPN, no cloud.',
    },
    matrixTrace: 'Matriz CIBMAQ > A0',
  },
  {
    id: 'remoteProgramming',
    group: 'operational',
    label: { es: 'Programacion remota', en: 'Remote programming' },
    description: {
      es: 'Actualizacion remota de PLC/HMI bajo control.',
      en: 'Remote PLC/HMI update under controlled access.',
    },
    tooltip: {
      es: 'Matriz CIBMAQ A4: VPN cifrada, MFA y ACL.',
      en: 'CIBMAQ matrix A4: encrypted VPN, MFA and ACL.',
    },
    matrixTrace: 'Matriz CIBMAQ > A4',
  },
  {
    id: 'remoteMaintenance',
    group: 'operational',
    label: { es: 'Mantenimiento remoto', en: 'Remote maintenance' },
    description: {
      es: 'Diagnostico y soporte remoto por sesion.',
      en: 'Remote diagnostics and support by session.',
    },
    tooltip: {
      es: 'Matriz CIBMAQ A4/A5: acceso nominal, grabacion y rollback.',
      en: 'CIBMAQ matrix A4/A5: named users, recording and rollback.',
    },
    matrixTrace: 'Matriz CIBMAQ > A4, A5',
  },
  {
    id: 'thirdPartyAccess',
    group: 'operational',
    label: { es: 'Acceso de terceros', en: 'Third-party access' },
    description: {
      es: 'Integradores u OEM externos con acceso limitado.',
      en: 'External integrators/OEM access with strict boundaries.',
    },
    tooltip: {
      es: 'Requiere segmentacion y cuentas nominales.',
      en: 'Requires segmentation and named accounts.',
    },
    matrixTrace: 'Matriz CIBMAQ > A4, A5',
  },
  {
    id: 'telemetry',
    group: 'data',
    label: { es: 'Telemetria OT', en: 'OT telemetry' },
    description: {
      es: 'Envio de variables de proceso para observabilidad.',
      en: 'Process variable streaming for observability.',
    },
    tooltip: {
      es: 'Matriz CIBMAQ A2: flujo preferible de solo lectura.',
      en: 'CIBMAQ matrix A2: preferably read-only data flow.',
    },
    matrixTrace: 'Matriz CIBMAQ > A2',
  },
  {
    id: 'reporting',
    group: 'data',
    label: { es: 'Reporting y dashboards', en: 'Reporting and dashboards' },
    description: {
      es: 'Consulta historica y KPIs remotos.',
      en: 'Remote historical queries and KPI dashboards.',
    },
    tooltip: {
      es: 'Matriz CIBMAQ A3: sin acceso directo al PLC.',
      en: 'CIBMAQ matrix A3: no direct PLC access.',
    },
    matrixTrace: 'Matriz CIBMAQ > A3',
  },
  {
    id: 'cloudIntegration',
    group: 'integration',
    label: { es: 'Integracion cloud/API', en: 'Cloud/API integration' },
    description: {
      es: 'Intercambio de datos con plataforma cloud.',
      en: 'Data exchange with cloud platforms.',
    },
    tooltip: {
      es: 'A3-A6 segun bidireccionalidad y gobierno de acceso.',
      en: 'A3-A6 depending on bidirectional flow and access governance.',
    },
    matrixTrace: 'Matriz CIBMAQ > A3, A6',
  },
  {
    id: 'erpScadaIntegration',
    group: 'integration',
    label: { es: 'Integracion ERP/SCADA', en: 'ERP/SCADA integration' },
    description: {
      es: 'Integracion IT/OT con usuarios y apps multiples.',
      en: 'IT/OT integration with multiple users and applications.',
    },
    tooltip: {
      es: 'Matriz CIBMAQ A6: capa intermedia/DMZ obligatoria.',
      en: 'CIBMAQ matrix A6: intermediate layer/DMZ is mandatory.',
    },
    matrixTrace: 'Matriz CIBMAQ > A6',
  },
  {
    id: 'aiAnalytics',
    group: 'advanced',
    label: { es: 'IA y analitica', en: 'AI and analytics' },
    description: {
      es: 'Deteccion de anomalias y analitica de proceso.',
      en: 'Anomaly detection and process analytics.',
    },
    tooltip: {
      es: 'Matriz CIBMAQ A7: IA sobre capa de datos separada.',
      en: 'CIBMAQ matrix A7: AI on a separate data layer.',
    },
    matrixTrace: 'Matriz CIBMAQ > A7',
  },
  {
    id: 'aiControlValidated',
    group: 'advanced',
    label: { es: 'IA con control validado', en: 'AI with validated control' },
    description: {
      es: 'Permitir control de proceso por IA solo por diseno validado.',
      en: 'Allow AI control only under validated design.',
    },
    tooltip: {
      es: 'A7 indica observacion por defecto; control requiere validacion explicita.',
      en: 'A7 defaults to observation; control requires explicit validation.',
    },
    matrixTrace: 'Matriz CIBMAQ > A7 regla clave',
  },
];

const byLayer = (
  ot: string[],
  edge: string[],
  data: string[],
  security: string[],
  integration?: string[],
) => ({ ot, edge, integration, data, security });

export const PROFILES: Record<ArchitectureProfileId, ArchitectureProfileDefinition> = {
  A0: {
    id: 'A0',
    kind: 'base',
    title: { es: 'A0 - Arquitectura local aislada', en: 'A0 - Local isolated architecture' },
    summary: {
      es: 'Operacion local sin conectividad externa.',
      en: 'Local-only operation without external connectivity.',
    },
    keyRule: {
      es: 'No se permite router, VPN ni cloud.',
      en: 'Router, VPN and cloud are not allowed.',
    },
    mainRisk: {
      es: 'Perdida de configuracion o acceso fisico no controlado.',
      en: 'Configuration loss or uncontrolled physical access.',
    },
    matrixTrace: 'Matriz CIBMAQ > A0',
    layers: byLayer(
      ['PLC', 'HMI', 'Sensores'],
      ['Switch local aislado'],
      ['Sin capa de datos externa'],
      ['Control de acceso fisico', 'Backup PLC/HMI', 'Control de versiones'],
    ),
    baseline: {
      minimum: byLayer(
        ['PLC', 'HMI'],
        ['Red local aislada'],
        ['Sin cloud'],
        ['Acceso fisico controlado', 'Backup manual'],
      ),
      reinforced: byLayer(
        ['PLC', 'HMI', 'Sensores criticos'],
        ['Switch gestionado local'],
        ['Historial local de cambios'],
        ['Control de versiones formal', 'Procedimiento restore probado'],
      ),
    },
    tradeOffs: {
      benefits: [
        { es: 'Menor superficie de ataque.', en: 'Lowest attack surface.' },
        { es: 'Operacion simple.', en: 'Simple operations.' },
      ],
      risks: [
        { es: 'Sin observabilidad remota.', en: 'No remote observability.' },
        { es: 'Dependencia de presencia fisica.', en: 'Requires on-site intervention.' },
      ],
      complexity: 'Low',
      relativeCost: 'Low',
      operationalLoad: 'Medium',
    },
    blueprint: {
      es: 'Activos OT en red local cerrada. Cambios solo presenciales con backup y registro local.',
      en: 'OT assets stay in a closed local network. Changes are on-site only with backup and local logs.',
    },
    executiveSummary: {
      es: 'A0 minimiza exposicion externa para maquinas sin necesidad de telemetria ni acceso remoto.',
      en: 'A0 minimizes external exposure for machines with no telemetry or remote-access needs.',
    },
  },
  A1: {
    id: 'A1',
    kind: 'base',
    title: { es: 'A1 - Control local de ingenieria', en: 'A1 - Local engineering control' },
    summary: {
      es: 'Cambios locales con trazabilidad y control de versiones.',
      en: 'Local engineering changes with traceability and version control.',
    },
    keyRule: {
      es: 'Sin conectividad remota persistente.',
      en: 'No persistent remote connectivity.',
    },
    mainRisk: {
      es: 'Cambios no trazados y dependencia de personas clave.',
      en: 'Untracked changes and key-person dependency.',
    },
    matrixTrace: 'Matriz CIBMAQ > A1',
    layers: byLayer(
      ['PLC', 'HMI'],
      ['Puerto de ingenieria/VLAN local'],
      ['Repositorio local de versiones'],
      ['Credenciales de programacion', 'Backup pre-cambio', 'Restore validado'],
    ),
    baseline: {
      minimum: byLayer(
        ['PLC'],
        ['Portatil de ingenieria local'],
        ['Bitacora local'],
        ['Backup previo'],
      ),
      reinforced: byLayer(
        ['PLC', 'HMI'],
        ['Switch gestionado con VLAN de ingenieria'],
        ['Repositorio versionado'],
        ['Control de cambios firmado', 'Pruebas de rollback'],
      ),
    },
    tradeOffs: {
      benefits: [
        { es: 'Gobierno de cambios local.', en: 'Improves local change governance.' },
      ],
      risks: [
        { es: 'Sin soporte remoto.', en: 'No remote support.' },
      ],
      complexity: 'Low',
      relativeCost: 'Low',
      operationalLoad: 'Medium',
    },
    blueprint: {
      es: 'La estacion de ingenieria se conecta solo en sitio a una VLAN local dedicada. No hay salida a internet.',
      en: 'The engineering station connects on-site only to a dedicated local VLAN, with no internet path.',
    },
    executiveSummary: {
      es: 'A1 agrega disciplina de cambios sin abrir superficie remota.',
      en: 'A1 introduces change discipline while keeping remote exposure closed.',
    },
  },
  A2: {
    id: 'A2',
    kind: 'base',
    title: { es: 'A2 - Telemetria segura', en: 'A2 - Secure telemetry' },
    summary: {
      es: 'Datos operativos hacia cloud con aislamiento del control.',
      en: 'Operational data to cloud with control-plane isolation.',
    },
    keyRule: {
      es: 'Telemetria preferible de solo lectura.',
      en: 'Telemetry should be read-only whenever possible.',
    },
    mainRisk: {
      es: 'El gateway puede convertirse en punto de entrada.',
      en: 'Gateway may become an entry point.',
    },
    oemReference: 'RIGUAL (IFM/Proemion)',
    matrixTrace: 'Matriz CIBMAQ > A2',
    layers: byLayer(
      ['PLC', 'Sensores'],
      ['Gateway IIoT / Router industrial'],
      ['Registro Histórico / Data Lake'],
      ['Cifrado TLS', 'Autenticacion de dispositivo', 'Logs de envio'],
      ['API de solo lectura'],
    ),
    baseline: {
      minimum: byLayer(
        ['PLC'],
        ['Gateway de salida'],
        ['Base de datos historica'],
        ['Canal cifrado', 'ACL de egreso'],
      ),
      reinforced: byLayer(
        ['PLC', 'Sensores adicionales'],
        ['Gateway con hardening'],
        ['Data lake con retencion'],
        ['Certificados rotativos', 'Monitor de integridad'],
      ),
    },
    tradeOffs: {
      benefits: [
        { es: 'Activa observabilidad remota.', en: 'Enables remote observability.' },
      ],
      risks: [
        { es: 'Requiere gobierno de datos.', en: 'Requires strong data governance.' },
      ],
      complexity: 'Medium',
      relativeCost: 'Medium',
      operationalLoad: 'Medium',
    },
    blueprint: {
      es: 'Datos OT salen por gateway endurecido hacia capa historica. No se permite retorno de comandos al PLC.',
      en: 'OT data exits through a hardened gateway into historical storage. Command return to PLC is blocked.',
    },
    executiveSummary: {
      es: 'A2 es la base para monitoreo y mantenimiento predictivo sin programacion remota.',
      en: 'A2 is the baseline for monitoring and predictive maintenance without remote programming.',
    },
  },
  A3: {
    id: 'A3',
    kind: 'base',
    title: { es: 'A3 - Reporting remoto', en: 'A3 - Remote reporting' },
    summary: {
      es: 'Dashboards y consulta historica con API segura.',
      en: 'Dashboards and historical reporting through secure APIs.',
    },
    keyRule: {
      es: 'Reporting no implica acceso directo al PLC.',
      en: 'Reporting must not enable direct PLC access.',
    },
    mainRisk: {
      es: 'Exfiltracion de datos o consultas no autorizadas.',
      en: 'Data exfiltration or unauthorized queries.',
    },
    oemReference: 'FRUMECAR (K2 / Google Cloud)',
    matrixTrace: 'Matriz CIBMAQ > A3',
    layers: byLayer(
      ['PLC', 'HMI'],
      ['Gateway de datos'],
      ['Dashboard web / BI'],
      ['Control de usuarios', 'Logs de consulta', 'Segregacion DB operativa/externa'],
      ['API segura'],
    ),
    baseline: {
      minimum: byLayer(
        ['PLC'],
        ['Gateway de datos'],
        ['Dashboard basico'],
        ['Autenticacion de usuario', 'Registro de consultas'],
      ),
      reinforced: byLayer(
        ['PLC', 'HMI'],
        ['Gateway dual con failover'],
        ['Data mart segmentado por cliente'],
        ['RBAC por tenant', 'Alertas de anomalias de acceso'],
      ),
    },
    tradeOffs: {
      benefits: [
        { es: 'Mejora la toma de decisiones operativas.', en: 'Improves operational decision-making.' },
      ],
      risks: [
        { es: 'Aumenta exposicion de datos.', en: 'Increases data exposure.' },
      ],
      complexity: 'Medium',
      relativeCost: 'Medium',
      operationalLoad: 'Medium',
    },
    blueprint: {
      es: 'El dashboard consume datos historicos mediante API y nunca interactua con PLC de forma directa.',
      en: 'The dashboard reads historical data via API and never interacts directly with PLCs.',
    },
    executiveSummary: {
      es: 'A3 habilita visibilidad de negocio manteniendo separado el plano de control OT.',
      en: 'A3 enables business visibility while keeping OT control planes separate.',
    },
  },
  A4: {
    id: 'A4',
    kind: 'base',
    title: { es: 'A4 - Mantenimiento remoto seguro', en: 'A4 - Secure remote maintenance' },
    summary: {
      es: 'Soporte remoto con VPN, MFA y acceso granular.',
      en: 'Remote maintenance using VPN, MFA and granular access.',
    },
    keyRule: {
      es: 'La VPN no debe abrir toda la red OT.',
      en: 'VPN must not expose the full OT network.',
    },
    mainRisk: {
      es: 'Compromiso de credenciales o mala segmentacion.',
      en: 'Credential compromise or poor segmentation.',
    },
    oemReference: 'RIGUAL / TATOMA / FRUMECAR',
    matrixTrace: 'Matriz CIBMAQ > A4',
    layers: byLayer(
      ['PLC', 'HMI'],
      ['Router industrial', 'Jump host'],
      ['Portal de soporte'],
      ['VPN cifrada', 'MFA', 'ACL por activo', 'Grabacion de sesion'],
      ['Control remoto acotado por servicio'],
    ),
    baseline: {
      minimum: byLayer(
        ['PLC'],
        ['Router industrial'],
        ['Portal de acceso remoto'],
        ['VPN + MFA', 'Backup previo'],
      ),
      reinforced: byLayer(
        ['PLC', 'HMI'],
        ['Jump server con lista blanca'],
        ['Portal con aprobacion por ticket'],
        ['Sesiones grabadas', 'Rollback documentado', 'SIEM de eventos'],
      ),
    },
    tradeOffs: {
      benefits: [
        { es: 'Reduce tiempos de parada.', en: 'Reduces downtime.' },
      ],
      risks: [
        { es: 'Mayor superficie de ataque remota.', en: 'Adds remote attack surface.' },
      ],
      complexity: 'Medium',
      relativeCost: 'Medium',
      operationalLoad: 'High',
    },
    blueprint: {
      es: 'Tecnicos acceden por VPN con MFA y alcance por activo. Cada sesion deja evidencia y plan de rollback.',
      en: 'Technicians connect through VPN+MFA with asset-level scope. Every session is audited with rollback plans.',
    },
    executiveSummary: {
      es: 'A4 permite soporte remoto controlado sin abrir acceso OT amplio.',
      en: 'A4 enables controlled remote support without broad OT exposure.',
    },
  },
  A5: {
    id: 'A5',
    kind: 'base',
    title: { es: 'A5 - Dual mantenimiento + telemetria', en: 'A5 - Dual maintenance + telemetry' },
    summary: {
      es: 'Canal de mantenimiento separado del canal de datos.',
      en: 'Maintenance channel separated from telemetry channel.',
    },
    keyRule: {
      es: 'Mantenimiento y telemetria no comparten privilegios.',
      en: 'Maintenance and telemetry must not share privileges.',
    },
    mainRisk: {
      es: 'Conflicto de configuraciones entre dos canales externos.',
      en: 'Configuration conflict across dual external channels.',
    },
    oemReference: 'RIGUAL',
    matrixTrace: 'Matriz CIBMAQ > A5',
    layers: byLayer(
      ['PLC', 'HMI', 'Dispositivos de campo'],
      ['Router industrial', 'Gateway telemetria'],
      ['Portal cloud + historico'],
      ['VPN + MFA', 'ACL separadas', 'Logs diferenciados'],
      ['Canal mantenimiento', 'Canal datos'],
    ),
    baseline: {
      minimum: byLayer(
        ['PLC'],
        ['Router + gateway'],
        ['Historian cloud'],
        ['VPN + cifrado telemetria'],
      ),
      reinforced: byLayer(
        ['PLC', 'HMI'],
        ['Firewalls separados por canal'],
        ['Portal unificado con RBAC'],
        ['MFA obligatoria', 'Auditoria cruzada', 'Politica de rotacion de secretos'],
      ),
    },
    tradeOffs: {
      benefits: [
        { es: 'Combina continuidad operativa y observabilidad.', en: 'Combines service continuity with observability.' },
      ],
      risks: [
        { es: 'Mayor complejidad operativa.', en: 'Higher operational complexity.' },
      ],
      complexity: 'High',
      relativeCost: 'High',
      operationalLoad: 'High',
    },
    blueprint: {
      es: 'Dos rutas externas independientes: mantenimiento bajo demanda y telemetria continua cifrada sin privilegios de control.',
      en: 'Two independent external paths: on-demand maintenance and encrypted continuous telemetry without control privileges.',
    },
    executiveSummary: {
      es: 'A5 es la recomendacion para plantas que requieren simultaneamente soporte remoto y datos continuos.',
      en: 'A5 is recommended when remote support and continuous telemetry are both mandatory.',
    },
  },
  A6: {
    id: 'A6',
    kind: 'base',
    title: { es: 'A6 - Integracion IT/OT con capa intermedia', en: 'A6 - IT/OT integration with intermediate layer' },
    summary: {
      es: 'SCADA/ERP/cloud con zona de integracion controlada.',
      en: 'SCADA/ERP/cloud with controlled integration zone.',
    },
    keyRule: {
      es: 'Ningun sistema IT/cloud accede directo a PLC sin capa intermedia.',
      en: 'No IT/cloud system reaches PLC directly without an intermediate layer.',
    },
    mainRisk: {
      es: 'Mayor superficie por convergencia IT/OT.',
      en: 'Larger attack surface due to IT/OT convergence.',
    },
    oemReference: 'FRUMECAR',
    matrixTrace: 'Matriz CIBMAQ > A6',
    layers: byLayer(
      ['Red OT segmentada', 'PLC', 'HMI'],
      ['Firewall inter-zona', 'IDS/IPS'],
      ['SCADA, ERP y Cloud Apps'],
      ['Control de usuarios', 'Logs centralizados', 'Backups multinivel'],
      ['DMZ / zona de integracion IT-OT'],
    ),
    baseline: {
      minimum: byLayer(
        ['PLC', 'SCADA local'],
        ['Firewall industrial'],
        ['ERP connector'],
        ['RBAC basico', 'Registro central'],
        ['DMZ simple'],
      ),
      reinforced: byLayer(
        ['Red OT completa segmentada'],
        ['Firewall redundante + IDS'],
        ['Servicios IT/Cloud segregados'],
        ['SIEM', 'Parches orquestados', 'Backups por capa'],
        ['DMZ con proxies y broker de mensajes'],
      ),
    },
    tradeOffs: {
      benefits: [
        { es: 'Escala integracion empresarial.', en: 'Scales enterprise integration.' },
      ],
      risks: [
        { es: 'Requiere gobierno de identidad y segmentacion estricta.', en: 'Requires strict identity governance and segmentation.' },
      ],
      complexity: 'High',
      relativeCost: 'High',
      operationalLoad: 'High',
    },
    blueprint: {
      es: 'El intercambio entre OT e IT/cloud pasa siempre por DMZ con politicas explicitas, inspeccion y trazabilidad completa.',
      en: 'All OT-to-IT/cloud exchanges traverse a DMZ with explicit policy, inspection and full traceability.',
    },
    executiveSummary: {
      es: 'A6 es obligatorio cuando hay integracion bidireccional con ERP/SCADA/cloud.',
      en: 'A6 is mandatory for bidirectional ERP/SCADA/cloud integration.',
    },
  },
  A7: {
    id: 'A7',
    kind: 'base',
    title: { es: 'A7 - Observabilidad e IA segura', en: 'A7 - Secure observability and AI' },
    summary: {
      es: 'IA sobre capa de datos desacoplada del control industrial.',
      en: 'AI over a data layer decoupled from industrial control.',
    },
    keyRule: {
      es: 'La IA observa por defecto; no controla salvo validacion explicita.',
      en: 'AI defaults to observation; control only with explicit validation.',
    },
    mainRisk: {
      es: 'Data poisoning o acciones no autorizadas por mala gobernanza de modelos.',
      en: 'Data poisoning or unauthorized actions under poor model governance.',
    },
    oemReference: 'FRUMECAR (chatbot analitico)',
    matrixTrace: 'Matriz CIBMAQ > A7',
    layers: byLayer(
      ['Sensores inteligentes', 'PLC'],
      ['Edge analytics / ingestion'],
      ['Data lake + AI workspace'],
      ['RBAC de datasets', 'Logs de consulta', 'Control de APIs'],
      ['Zona observacional separada'],
    ),
    baseline: {
      minimum: byLayer(
        ['PLC', 'Sensores'],
        ['Gateway de ingesta'],
        ['Repositorio de datos historicos'],
        ['Acceso read-only', 'Registro de consultas'],
        ['Canal de solo lectura hacia IA'],
      ),
      reinforced: byLayer(
        ['PLC', 'Sensores y metadatos de calidad'],
        ['Edge processor con validacion'],
        ['Plataforma MLOps con versionado'],
        ['Anonimizacion', 'Policy engine', 'Validacion no recursiva'],
        ['Sandbox de inferencia auditado'],
      ),
    },
    tradeOffs: {
      benefits: [
        { es: 'Habilita deteccion avanzada de anomalias.', en: 'Enables advanced anomaly detection.' },
      ],
      risks: [
        { es: 'Riesgo de sobreconfiar en modelos.', en: 'Risk of over-trusting models.' },
      ],
      complexity: 'High',
      relativeCost: 'High',
      operationalLoad: 'High',
    },
    blueprint: {
      es: 'Los modelos IA consumen datos desde una capa observacional separada del control. Cualquier accion sobre OT requiere diseno validado.',
      en: 'AI models consume data from an observational layer separated from control. Any OT action requires validated design.',
    },
    executiveSummary: {
      es: 'A7 amplifica valor analitico manteniendo la seguridad del plano de control como restriccion primaria.',
      en: 'A7 maximizes analytics value while keeping control-plane safety as a hard constraint.',
    },
  },
  'A2+A4': {
    id: 'A2+A4',
    kind: 'composite',
    title: {
      es: 'A2+A4 - Telemetria y mantenimiento segregados',
      en: 'A2+A4 - Segregated telemetry and maintenance',
    },
    summary: {
      es: 'Perfil compuesto con separacion estricta entre datos y soporte remoto.',
      en: 'Composite profile with strict separation between data and remote support.',
    },
    keyRule: {
      es: 'Canales fisicos o logicos separados para telemetria y mantenimiento.',
      en: 'Telemetry and maintenance channels must be physically or logically separated.',
    },
    mainRisk: {
      es: 'Deriva de configuracion si ambos canales convergen por error.',
      en: 'Configuration drift if channels accidentally converge.',
    },
    matrixTrace: 'Matriz CIBMAQ > A2 + A4 (composicion)',
    layers: byLayer(
      ['PLC', 'HMI', 'Sensores'],
      ['Gateway telemetria dedicado', 'Router VPN dedicado'],
      ['Servidor Histórico / Portal soporte'],
      ['Politicas separadas', 'MFA', 'Auditoria diferenciada'],
      ['Doble zona de intercambio'],
    ),
    baseline: {
      minimum: byLayer(
        ['PLC'],
        ['Dos dispositivos de borde segregados'],
        ['Base de datos móvil + portal remoto'],
        ['VPN + TLS'],
        ['Separacion por VLAN'],
      ),
      reinforced: byLayer(
        ['PLC', 'HMI'],
        ['Segmentacion fisica por canal'],
        ['Plataforma unificada con control de rutas'],
        ['SIEM', 'Gestion de claves por canal'],
        ['DMZ dual para mantenimiento y datos'],
      ),
    },
    tradeOffs: {
      benefits: [
        { es: 'Maximiza aislamiento funcional.', en: 'Maximizes functional isolation.' },
      ],
      risks: [
        { es: 'Mayor costo de despliegue.', en: 'Higher deployment cost.' },
      ],
      complexity: 'High',
      relativeCost: 'High',
      operationalLoad: 'High',
    },
    blueprint: {
      es: 'Dos caminos independientes: canal de datos outbound y canal de mantenimiento bajo demanda, con politicas y credenciales separadas.',
      en: 'Two independent paths: outbound data channel and on-demand maintenance channel with separate policies and credentials.',
    },
    executiveSummary: {
      es: 'A2+A4 se recomienda cuando la organizacion exige segregacion estricta de telemetria y soporte remoto.',
      en: 'A2+A4 is recommended when the organization requires strict segregation of telemetry and remote support.',
    },
  },
};

export const PROFILE_ORDER: ArchitectureProfileId[] = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A2+A4', 'A6', 'A7'];

export const REQUIREMENT_TO_CAPABILITY_RULES: RequirementToCapabilityRule[] = [
  {
    id: 'R2C-LOCAL',
    requirement: 'localOnly',
    capability: 'cap.local_isolated',
    reason: {
      es: 'Operacion aislada requerida por negocio.',
      en: 'Isolated operation is a business requirement.',
    },
    matrixTrace: 'A0',
  },
  {
    id: 'R2C-REMOTE-PROG',
    requirement: 'remoteProgramming',
    capability: 'cap.remote_programming',
    reason: {
      es: 'Se necesita programacion remota bajo control.',
      en: 'Remote programming is required under controlled access.',
    },
    matrixTrace: 'A4',
  },
  {
    id: 'R2C-REMOTE-MAINT',
    requirement: 'remoteMaintenance',
    capability: 'cap.remote_maintenance',
    reason: {
      es: 'Soporte tecnico remoto requerido.',
      en: 'Remote technical support is required.',
    },
    matrixTrace: 'A4, A5',
  },
  {
    id: 'R2C-THIRD-PARTY',
    requirement: 'thirdPartyAccess',
    capability: 'cap.third_party_access',
    reason: {
      es: 'Acceso acotado de integradores/terceros.',
      en: 'Scoped access for integrators/third parties.',
    },
    matrixTrace: 'A4, A5',
  },
  {
    id: 'R2C-TELEMETRY',
    requirement: 'telemetry',
    capability: 'cap.telemetry',
    reason: {
      es: 'Necesidad de enviar datos OT.',
      en: 'Need to send OT data.',
    },
    matrixTrace: 'A2',
  },
  {
    id: 'R2C-REPORTING',
    requirement: 'reporting',
    capability: 'cap.reporting',
    reason: {
      es: 'Necesidad de dashboards o reportes remotos.',
      en: 'Need for dashboards or remote reports.',
    },
    matrixTrace: 'A3',
  },
  {
    id: 'R2C-CLOUD',
    requirement: 'cloudIntegration',
    capability: 'cap.cloud_exchange',
    reason: {
      es: 'Integracion con plataforma cloud/API.',
      en: 'Integration with cloud/API platform.',
    },
    matrixTrace: 'A3, A6',
  },
  {
    id: 'R2C-ERP-SCADA',
    requirement: 'erpScadaIntegration',
    capability: 'cap.it_ot_bidirectional',
    reason: {
      es: 'Integracion ERP/SCADA bidireccional.',
      en: 'Bidirectional ERP/SCADA integration.',
    },
    matrixTrace: 'A6',
  },
  {
    id: 'R2C-AI',
    requirement: 'aiAnalytics',
    capability: 'cap.ai_observability',
    reason: {
      es: 'Uso de IA para analitica industrial.',
      en: 'AI use for industrial analytics.',
    },
    matrixTrace: 'A7',
  },
  {
    id: 'R2C-AI-CTRL',
    requirement: 'aiControlValidated',
    capability: 'cap.ai_control_validated',
    reason: {
      es: 'Control por IA explicitamente validado.',
      en: 'AI control explicitly validated.',
    },
    matrixTrace: 'A7 regla clave',
  },
];

export const CAPABILITY_TO_PROFILE_RULES: CapabilityToProfileRule[] = [
  {
    id: 'C2P-LOCAL',
    capability: 'cap.local_isolated',
    matrixTrace: 'A0',
    weights: [
      { profileId: 'A0', score: 7, reason: { es: 'A0 es la opcion natural aislada.', en: 'A0 is the natural isolated option.' } },
      { profileId: 'A1', score: 2, reason: { es: 'A1 conserva aislamiento con control local.', en: 'A1 keeps isolation with local control.' } },
    ],
  },
  {
    id: 'C2P-REMOTE-PROG',
    capability: 'cap.remote_programming',
    matrixTrace: 'A4',
    weights: [
      { profileId: 'A4', score: 6, reason: { es: 'A4 cubre programacion remota segura.', en: 'A4 covers secure remote programming.' } },
      { profileId: 'A5', score: 3, reason: { es: 'A5 incluye mantenimiento remoto.', en: 'A5 includes remote maintenance.' } },
      { profileId: 'A2+A4', score: 4, reason: { es: 'Perfil compuesto admite programacion remota segregada.', en: 'Composite profile supports segregated remote programming.' } },
    ],
  },
  {
    id: 'C2P-REMOTE-MAINT',
    capability: 'cap.remote_maintenance',
    matrixTrace: 'A4, A5',
    weights: [
      { profileId: 'A4', score: 6, reason: { es: 'A4 prioriza soporte remoto seguro.', en: 'A4 prioritizes secure remote support.' } },
      { profileId: 'A5', score: 4, reason: { es: 'A5 agrega telemetria al mantenimiento.', en: 'A5 adds telemetry to maintenance.' } },
      { profileId: 'A2+A4', score: 5, reason: { es: 'A2+A4 separa soporte y telemetria.', en: 'A2+A4 separates support and telemetry.' } },
    ],
  },
  {
    id: 'C2P-THIRD-PARTY',
    capability: 'cap.third_party_access',
    matrixTrace: 'A4, A5',
    weights: [
      { profileId: 'A4', score: 3, reason: { es: 'A4 controla acceso nominal.', en: 'A4 controls named access.' } },
      { profileId: 'A5', score: 3, reason: { es: 'A5 demanda doble control de acceso.', en: 'A5 requires dual access governance.' } },
      { profileId: 'A6', score: 2, reason: { es: 'A6 opera multiperfil.', en: 'A6 supports multi-role operations.' } },
    ],
  },
  {
    id: 'C2P-TELEMETRY',
    capability: 'cap.telemetry',
    matrixTrace: 'A2, A5',
    weights: [
      { profileId: 'A2', score: 6, reason: { es: 'A2 es telemetria segura pura.', en: 'A2 is pure secure telemetry.' } },
      { profileId: 'A5', score: 4, reason: { es: 'A5 incorpora telemetria + mantenimiento.', en: 'A5 combines telemetry and maintenance.' } },
      { profileId: 'A2+A4', score: 5, reason: { es: 'A2+A4 refuerza separacion por canal.', en: 'A2+A4 reinforces channel separation.' } },
      { profileId: 'A7', score: 3, reason: { es: 'A7 requiere base de telemetria.', en: 'A7 needs telemetry as baseline.' } },
    ],
  },
  {
    id: 'C2P-REPORTING',
    capability: 'cap.reporting',
    matrixTrace: 'A3',
    weights: [
      { profileId: 'A3', score: 6, reason: { es: 'A3 optimizado para reporting.', en: 'A3 is optimized for reporting.' } },
      { profileId: 'A6', score: 3, reason: { es: 'A6 absorbe reporting empresarial.', en: 'A6 absorbs enterprise reporting.' } },
      { profileId: 'A7', score: 2, reason: { es: 'A7 puede consumir reporting como entrada.', en: 'A7 can consume reporting data.' } },
    ],
  },
  {
    id: 'C2P-CLOUD',
    capability: 'cap.cloud_exchange',
    matrixTrace: 'A3, A6',
    weights: [
      { profileId: 'A3', score: 3, reason: { es: 'A3 usa cloud para dashboards.', en: 'A3 uses cloud for dashboards.' } },
      { profileId: 'A5', score: 2, reason: { es: 'A5 puede usar portal cloud.', en: 'A5 can use cloud portals.' } },
      { profileId: 'A6', score: 4, reason: { es: 'A6 gestiona integracion IT/OT y cloud.', en: 'A6 governs IT/OT and cloud integration.' } },
      { profileId: 'A7', score: 3, reason: { es: 'A7 necesita data plane cloud/edge.', en: 'A7 requires cloud/edge data plane.' } },
    ],
  },
  {
    id: 'C2P-ERP-SCADA',
    capability: 'cap.it_ot_bidirectional',
    matrixTrace: 'A6',
    weights: [
      { profileId: 'A6', score: 8, reason: { es: 'A6 es la arquitectura objetivo para IT/OT.', en: 'A6 is the target architecture for IT/OT.' } },
      { profileId: 'A7', score: 3, reason: { es: 'A7 se soporta sobre A6 en escenarios enterprise.', en: 'A7 is supported on A6 in enterprise setups.' } },
    ],
  },
  {
    id: 'C2P-AI',
    capability: 'cap.ai_observability',
    matrixTrace: 'A7',
    weights: [
      { profileId: 'A7', score: 9, reason: { es: 'A7 cubre IA observacional segura.', en: 'A7 covers secure observational AI.' } },
      { profileId: 'A6', score: 2, reason: { es: 'A6 puede ser baseline infra para IA.', en: 'A6 can be an infrastructure baseline for AI.' } },
    ],
  },
  {
    id: 'C2P-AI-CTRL',
    capability: 'cap.ai_control_validated',
    matrixTrace: 'A7 regla clave',
    weights: [
      { profileId: 'A7', score: 2, reason: { es: 'Validacion explicita habilita alcance adicional en A7.', en: 'Explicit validation unlocks additional A7 scope.' } },
    ],
  },
  {
    id: 'C2P-DMZ',
    capability: 'cap.dmz_required',
    matrixTrace: 'A6 regla clave',
    weights: [
      { profileId: 'A6', score: 3, reason: { es: 'DMZ es requisito estructural en A6.', en: 'DMZ is a structural requirement in A6.' } },
      { profileId: 'A7', score: 1, reason: { es: 'A7 en enterprise tambien requiere capa intermedia.', en: 'Enterprise A7 also needs an intermediate layer.' } },
    ],
  },
  {
    id: 'C2P-AI-OBSERVE-ONLY',
    capability: 'cap.ai_observe_only',
    matrixTrace: 'A7 regla clave',
    weights: [
      { profileId: 'A7', score: 1, reason: { es: 'Refuerza el modo observacional seguro.', en: 'Reinforces secure observational mode.' } },
    ],
  },
];

export const COMPOSITION_RULES: CompositionRule[] = [
  {
    id: 'COMP-A5-DUAL',
    allCapabilities: ['cap.telemetry', 'cap.remote_maintenance'],
    compositeProfile: 'A5',
    scoreBonus: 4,
    reason: {
      es: 'Telemetria y mantenimiento remoto en paralelo apuntan a arquitectura dual.',
      en: 'Telemetry plus remote maintenance points to a dual-channel architecture.',
    },
    matrixTrace: 'A5',
  },
  {
    id: 'COMP-A2A4-STRICT',
    allCapabilities: ['cap.telemetry', 'cap.remote_maintenance', 'cap.third_party_access'],
    compositeProfile: 'A2+A4',
    scoreBonus: 6,
    reason: {
      es: 'Telemetria + mantenimiento + terceros requiere segregacion reforzada.',
      en: 'Telemetry + maintenance + third-party access requires reinforced segregation.',
    },
    matrixTrace: 'A2 + A4 (compuesto)',
  },
  {
    id: 'COMP-A7-ENTERPRISE',
    allCapabilities: ['cap.ai_observability', 'cap.it_ot_bidirectional'],
    compositeProfile: 'A7',
    scoreBonus: 3,
    reason: {
      es: 'IA industrial en contexto enterprise.',
      en: 'Industrial AI in enterprise context.',
    },
    matrixTrace: 'A7 sobre A6',
  },
];

export const CONSTRAINT_RULES: ConstraintRule[] = [
  {
    id: 'CONST-LOCAL-STRICT',
    ifRequirement: 'localOnly',
    forceCapability: 'cap.local_isolated',
    penalties: [
      { profileId: 'A1', scoreDelta: -5 },
      { profileId: 'A2', scoreDelta: -20 },
      { profileId: 'A3', scoreDelta: -20 },
      { profileId: 'A4', scoreDelta: -20 },
      { profileId: 'A5', scoreDelta: -20 },
      { profileId: 'A2+A4', scoreDelta: -20 },
      { profileId: 'A6', scoreDelta: -20 },
      { profileId: 'A7', scoreDelta: -20 },
    ],
    reason: {
      es: 'Operacion local invalida perfiles con conectividad remota.',
      en: 'Local-only operation invalidates remote-connectivity profiles.',
    },
    matrixTrace: 'A0',
  },
  {
    id: 'CONST-AI-OBSERVE',
    ifRequirement: 'aiAnalytics',
    unlessRequirement: 'aiControlValidated',
    forceCapability: 'cap.ai_observe_only',
    penalties: [],
    reason: {
      es: 'Sin validacion explicita, la IA se mantiene en modo observacional.',
      en: 'Without explicit validation, AI remains observational.',
    },
    matrixTrace: 'A7 regla clave',
  },
  {
    id: 'CONST-DMZ-REQUIRED',
    ifRequirement: 'erpScadaIntegration',
    forceCapability: 'cap.dmz_required',
    penalties: [
      { profileId: 'A3', scoreDelta: -2 },
      { profileId: 'A4', scoreDelta: -2 },
    ],
    reason: {
      es: 'Integracion ERP/SCADA exige capa intermedia controlada.',
      en: 'ERP/SCADA integration requires a controlled intermediate layer.',
    },
    matrixTrace: 'A6 regla clave',
  },
  {
    id: 'CONST-A2A4-NOT-ENTERPRISE',
    ifRequirement: 'erpScadaIntegration',
    penalties: [
      { profileId: 'A2+A4', scoreDelta: -10 },
      { profileId: 'A5', scoreDelta: -3 },
    ],
    reason: {
      es: 'Con ERP/SCADA bidireccional, se priorizan arquitecturas enterprise con capa intermedia (A6/A7).',
      en: 'With bidirectional ERP/SCADA, enterprise architectures with intermediate layers (A6/A7) are prioritized.',
    },
    matrixTrace: 'A6 prioridad sobre A5/A2+A4',
  },
  {
    id: 'CONST-A2A4-NOT-AI',
    ifRequirement: 'aiAnalytics',
    penalties: [
      { profileId: 'A2+A4', scoreDelta: -8 },
    ],
    reason: {
      es: 'Si hay analitica IA, la recomendacion debe escalar hacia A7 sobre la base A6.',
      en: 'If AI analytics is active, recommendation should scale toward A7 on top of A6.',
    },
    matrixTrace: 'A7 prioridad sobre A2+A4',
  },
];

export const CONFLICT_RULES: ConflictRule[] = [
  {
    id: 'CONFLICT-LOCAL-REMOTE',
    requirements: ['localOnly', 'remoteProgramming'],
    message: {
      es: 'No es coherente pedir operacion local aislada y programacion remota al mismo tiempo.',
      en: 'Local isolated operation conflicts with remote programming.',
    },
    resolution: {
      es: 'Se prioriza la necesidad remota y se desactiva localOnly durante la normalizacion.',
      en: 'Remote need is prioritized and localOnly is disabled during normalization.',
    },
    matrixTrace: 'A0 vs A4',
  },
  {
    id: 'CONFLICT-LOCAL-TELEMETRY',
    requirements: ['localOnly', 'telemetry'],
    message: {
      es: 'Telemetria implica conectividad y entra en conflicto con A0.',
      en: 'Telemetry implies connectivity and conflicts with A0.',
    },
    resolution: {
      es: 'Se desactiva localOnly para evaluar A2+.',
      en: 'localOnly is disabled to evaluate A2+ profiles.',
    },
    matrixTrace: 'A0 vs A2',
  },
  {
    id: 'CONFLICT-AI-CTRL-WITHOUT-AI',
    requirements: ['aiControlValidated', 'aiAnalytics'],
    message: {
      es: 'Validacion de control por IA no aplica si IA/analitica no esta activa.',
      en: 'AI-control validation does not apply when AI analytics is disabled.',
    },
    resolution: {
      es: 'Se desactiva aiControlValidated si aiAnalytics no esta seleccionado.',
      en: 'aiControlValidated is disabled when aiAnalytics is not selected.',
    },
    matrixTrace: 'A7',
  },
];

export const PROFILE_BASE_SCORE: Record<ArchitectureProfileId, number> = {
  A0: 1,
  A1: 1,
  A2: 1,
  A3: 1,
  A4: 1,
  A5: 1,
  'A2+A4': 0,
  A6: 1,
  A7: 1,
};

export const PROFILE_DEFAULT_ALTERNATIVES: Record<ArchitectureProfileId, ArchitectureProfileId[]> = {
  A0: ['A1', 'A2'],
  A1: ['A0', 'A4'],
  A2: ['A3', 'A5'],
  A3: ['A2', 'A6'],
  A4: ['A5', 'A2+A4'],
  A5: ['A2+A4', 'A4'],
  'A2+A4': ['A5', 'A4'],
  A6: ['A7', 'A3'],
  A7: ['A6', 'A5'],
};

export const ORDERED_REQUIREMENT_IDS: RequirementId[] = REQUIREMENT_OPTIONS.map((item) => item.id);

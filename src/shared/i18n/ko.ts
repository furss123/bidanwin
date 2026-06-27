import type { TranslationSchema } from './types'

export const ko: TranslationSchema = {
  common: {
    confirm: '확인',
    cancel: '취소',
    remove: '삭제',
    skip: '건너뛰기',
    close: '닫기',
    copy: '복사',
    copied: '복사됨!',
    loading: '로딩 중…',
    error: '오류',
    open: '열기'
  },
  sidebar: {
    wordmark: '비단윈',
    wordmarkSub: 'BidanWin',
    categories: {
      all: '전체',
      apps: '앱',
      gamesXbox: '게임 & Xbox',
      microsoft: 'Microsoft',
      widgetsAi: '위젯 & AI',
      oem: 'OEM',
      system: '시스템'
    },
    restoreGuide: '복원 가이드',
    about: '정보',
    language: {
      ko: '한국어',
      en: 'English'
    }
  },
  app: {
    subtitleAllowed: '앱을 선택하고 삭제하세요. 각 배치 전에 복원 지점 생성을 권장합니다.',
    subtitleGated: '삭제할 앱을 선택하세요. 사전 요건이 충족될 때까지 삭제가 제한됩니다.'
  },
  appCard: {
    remove: '삭제',
    removed: '삭제됨 ✓',
    cautionBadge: '주의',
    removeTooltip: '관리자 권한이 필요합니다'
  },
  actionBar: {
    selected: '{n}개 선택됨',
    selectRecommended: '권장 항목 선택',
    clear: '선택 해제',
    removeSelected: '선택 항목 삭제',
    removing: '삭제 중…',
    alreadyRemoved: '선택한 앱이 이미 모두 삭제되었습니다.',
    batchWarn:
      '⚠ {n}개 앱 선택됨 — 작은 단위로 나눠서 삭제하는 것을 권장합니다.'
  },
  logPanel: {
    title: '로그',
    ready: '준비됨.',
    removing: '삭제 중…',
    clearLog: '로그 지우기',
    wingetAvailable: 'winget: 사용 가능',
    wingetMissing: 'winget: 없음',
    summary: '✓ {succeeded}개 완료 · ✗ {failed}개 실패 · ⊘ {blocked}개 차단',
    catalogLoaded: '카탈로그 로드됨 — 42개 앱',
    environmentLog:
      '환경: {windowsVersion} · admin={isAdmin} · ps={powershellAvailable} · winget={wingetAvailable}',
    startingRemoval: '{n}개 앱 삭제 시작…',
    selectionCleared: '선택이 해제되었습니다',
    selectedRecommended: '현재 보기에서 권장 앱 {n}개 선택됨',
    elevationCancelled: 'UAC 승인 취소됨 — 관리자 권한 없이 계속합니다',
    elevationFailed: '권한 상승 실패: {error}',
    elevationRequestFailed: '권한 상승 요청 실패',
    envLoadFailed: '환경 정보를 읽지 못했습니다',
    openLogPanel: '로그 패널 열기',
    closeLogPanel: '로그 패널 닫기'
  },
  statusBanner: {
    checkingEnv: '환경 확인 중…',
    adminRequired: '관리자 권한이 필요합니다',
    relaunch: '관리자로 재실행',
    relaunching: '요청 중…',
    adminOk: '관리자 권한으로 실행 중',
    previewMode: '미리보기 모드 — 이 OS에서는 실제 삭제가 지원되지 않습니다',
    powershellMissing: 'PowerShell을 찾을 수 없습니다 — 삭제 기능을 사용할 수 없습니다'
  },
  confirmModal: {
    title: '정말 삭제하시겠습니까?',
    warning: '⚠ 이 작업은 되돌리기 어렵습니다',
    andMore: '+ {n}개 더',
    confirmBtn: '삭제'
  },
  restorePointModal: {
    title: '시스템 복원 지점 생성',
    description:
      '삭제 전에 시스템 복원 지점을 만드는 것을 권장합니다. 문제가 발생하면 이 시점으로 되돌릴 수 있습니다.',
    createBtn: '복원 지점 생성 후 계속',
    creating: '생성 중…',
    success: '✓ 복원 지점이 생성되었습니다',
    continueAnyway: '계속 진행',
    throttleWarn: '최근 24시간 내 복원 지점이 이미 있습니다 — 건너뜁니다.',
    createFailed: '복원 지점 생성에 실패했습니다'
  },
  restoreGuide: {
    title: '복원 가이드',
    subtitle: '변경 사항을 되돌리거나 삭제된 앱을 재설치하는 방법',
    section1Title: '시스템 복원으로 되돌리기',
    section1Steps: [
      'Start 메뉴를 엽니다',
      '"복원 지점" 또는 "시스템 복원"을 검색합니다',
      '"시스템 복원"을 선택하고 마법사를 따릅니다',
      'BidanWin이 생성한 복원 지점을 선택합니다'
    ],
    openSystemRestore: '시스템 복원 열기',
    section2Title: '앱 개별 재설치',
    noRemovedApps: '이 세션에서 삭제된 앱이 없습니다.',
    perAppReinstall: '앱별 Appx 재설치:',
    reinstallAll: '남은 모든 Appx 패키지 재설치:',
    section3Title: 'Microsoft Store에서 재설치',
    section3Body:
      'Microsoft Store를 열고 앱 이름을 검색하거나, 위의 재설치 안내를 따르세요.',
    openStore: 'Microsoft Store 열기',
    openStoreShort: 'Store 열기',
    reinstallHintDefault: 'Microsoft Store에서 재설치',
    sessionTab: '이번 세션',
    allSessionsTab: '전체 이력',
    noRemovedAppsAll: '삭제 이력에 앱이 없습니다.'
  },
  aboutScreen: {
    title: '비단윈',
    subtitle: 'BidanWin',
    description: 'Windows 기본 앱 원클릭 제거 도구',
    descriptionEn: 'One-click Windows bloatware remover',
    copyright: '© 2026 HyoT · MIT License',
    viewLicense: 'MIT License 전문 보기',
    github: 'GitHub',
    version: '버전',
    os: '운영체제',
    adminStatus: '권한',
    adminYes: '관리자',
    adminNo: '일반 사용자'
  },
  emptyState: {
    message: '이 카테고리의 앱이 모두 제거되었습니다 ✓'
  },
  closeGuard: {
    message: '삭제가 진행 중입니다. 정말 종료하시겠습니까?',
    cancel: '취소',
    quit: '종료'
  },
  history: {
    navLabel: '이력',
    title: '삭제 이력',
    empty: '삭제 이력이 없습니다.',
    clearAll: '이력 전체 삭제',
    export: '보내기 (JSON)',
    openFile: '파일 위치 열기',
    confirmClear: '이력을 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    sessionLabel: '{date} — {n}개 앱',
    succeeded: '완료',
    failed: '실패',
    blocked: '차단됨',
    filterAll: '전체',
    appVersion: '앱 버전',
    windowsVersion: 'Windows 버전',
    noPath: '경로 없음',
    exportSuccess: '이력을보냈습니다: {path}',
    exportFailed: '이력보내기 실패',
    exportCancelled: '보내기가 취소되었습니다',
    cleared: '삭제 이력이 모두 지워졌습니다',
    errorColumn: '오류',
    timeColumn: '시간',
    appColumn: '앱',
    statusColumn: '상태'
  },
  catalogUpdate: {
    navBanner: '🆕 카탈로그 업데이트',
    newApps: '{n}개 새 앱 추가됨',
    viewNew: '새 앱 보기',
    dismiss: '닫기',
    checkBtn: '카탈로그 업데이트 확인',
    checking: '확인 중…',
    upToDate: '최신 상태입니다.',
    lastChecked: '마지막 확인: {time}',
    catalogVersion: '카탈로그 버전',
    error: '업데이트 확인 실패: {error}',
    skipped: '이 앱 버전에서는 지원되지 않는 카탈로그입니다.',
    newBadge: 'NEW',
    changelog: '변경 사항'
  },
  oem: {
    navLabel: 'OEM',
    detecting: '제조사 감지 중…',
    unknownManufacturer: '제조사를 감지할 수 없습니다.',
    noAppsFound: '설치된 OEM 앱이 없습니다.',
    detectedAs: '감지된 제조사: {manufacturer} ({model})',
    wingetScanSkipped: 'winget을 사용할 수 없음 — OEM 앱 검색을 건너뜁니다',
    manufacturers: {
      samsung: '삼성',
      lg: 'LG',
      hp: 'HP',
      dell: 'Dell',
      lenovo: 'Lenovo',
      asus: 'ASUS',
      acer: 'Acer',
      msi: 'MSI',
      toshiba: 'Toshiba',
      sony: 'Sony',
      microsoft: 'Microsoft Surface',
      unknown: '알 수 없음'
    }
  }
}

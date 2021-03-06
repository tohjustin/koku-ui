declare let insights: Insights;

interface Chrome {
  appNavClick: ({ id: string, secondaryNav: boolean }) => void;
  init: () => void;
  identifyApp: (appId: string) => void;
  navigation: (navFunc: any) => void;
  on: (event: string, eventFunc: any) => () => void;
  appAction: (pageName: string) => void;
  appObjectId: (params: string) => void;
}

interface Insights {
  chrome: Chrome;
}

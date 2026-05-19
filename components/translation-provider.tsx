'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'vi' | 'th' | 'pt' | 'ko' | 'fr';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    overview: 'Overview',
    portfolio: 'Portfolio',
    arbitrage: 'Arbitrage',
    referrals: 'Referrals',
    earnings: 'Earnings',
    settings: 'Settings',
    logout: 'Log Out',

    // Dashboard General
    welcomeBack: 'Welcome Back',
    totalBalance: 'Total Balance',
    activeInvestments: 'Active Investments',
    dailyEarnings: 'Daily Earnings',
    netProfit: 'Net Profit',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    addVirtualFunds: 'Add Virtual Funds',
    triggerRoi: 'Simulate Daily ROI',
    activePlans: 'Active Investment Plans',
    noActivePlans: 'No active plans found. Deposit or choose an arbitrage plan to start earning.',
    dailyYield: 'Daily Yield',
    expiresIn: 'Expires in',
    days: 'days',
    recentTransactions: 'Recent Transactions',
    noTransactions: 'No transactions found.',
    allRightsReserved: 'All rights reserved.',
    
    // Arbitrage Page
    selectPlan: 'Select an Arbitrage Plan',
    dailyReturn: 'Daily Return',
    duration: 'Duration',
    minDeposit: 'Min Deposit',
    maxDeposit: 'Max Deposit',
    investNow: 'Invest Now',
    insufficientFunds: 'Insufficient balance to invest in this plan.',
    investmentSuccessful: 'Investment successful!',
    enterAmount: 'Enter Investment Amount',

    // Referrals Page
    yourReferralCode: 'Your Referral Code',
    totalReferrals: 'Total Referrals',
    referredUsers: 'Referred Users List',
    noReferrals: 'You have not referred any users yet.',
    commissionEarned: 'Commission Earned',

    // Earnings Page
    earningsHistory: 'Earnings History',
    noEarnings: 'No earnings logged yet. Activate a plan and simulate daily ROI.',

    // Settings Page
    accountSettings: 'Account Settings',
    profileInformation: 'Profile Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    emailAddress: 'Email Address',
    saveChanges: 'Save Changes',
    appearance: 'Appearance',
    themeMode: 'Theme Mode',
    security: 'Security',
    changePassword: 'Change Password',
    twoFactor: 'Two-Factor Authentication',
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    marketAlerts: 'Market Alerts',
    privacy: 'Privacy',
    publicProfile: 'Public Profile',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
  },
  es: {
    // Navigation
    overview: 'Resumen',
    portfolio: 'Portafolio',
    arbitrage: 'Arbitraje',
    referrals: 'Referencias',
    earnings: 'Ganancias',
    settings: 'Configuración',
    logout: 'Cerrar sesión',

    // Dashboard General
    welcomeBack: 'Bienvenido de nuevo',
    totalBalance: 'Saldo total',
    activeInvestments: 'Inversiones activas',
    dailyEarnings: 'Ganancias diarias',
    netProfit: 'Beneficio neto',
    deposit: 'Depositar',
    withdraw: 'Retirar',
    addVirtualFunds: 'Añadir fondos virtuales',
    triggerRoi: 'Simular ROI diario',
    activePlans: 'Planes de inversión activos',
    noActivePlans: 'No se encontraron planes activos. Deposite o elija un plan de arbitraje para comenzar.',
    dailyYield: 'Rendimiento diario',
    expiresIn: 'Expira en',
    days: 'días',
    recentTransactions: 'Transacciones recientes',
    noTransactions: 'No se encontraron transacciones.',
    allRightsReserved: 'Todos los derechos reservados.',

    // Arbitrage Page
    selectPlan: 'Seleccione un plan de arbitraje',
    dailyReturn: 'Retorno diario',
    duration: 'Duración',
    minDeposit: 'Depósito mín.',
    maxDeposit: 'Depósito máx.',
    investNow: 'Invertir ahora',
    insufficientFunds: 'Saldo insuficiente para invertir en este plan.',
    investmentSuccessful: '¡Inversión exitosa!',
    enterAmount: 'Ingrese el monto de inversión',

    // Referrals Page
    yourReferralCode: 'Su código de referencia',
    totalReferrals: 'Referencias totales',
    referredUsers: 'Lista de usuarios referidos',
    noReferrals: 'Aún no ha referido a ningún usuario.',
    commissionEarned: 'Comisión ganada',

    // Earnings Page
    earningsHistory: 'Historial de ganancias',
    noEarnings: 'Aún no se registran ganancias. Active un plan y simule el ROI diario.',

    // Settings Page
    accountSettings: 'Configuración de la cuenta',
    profileInformation: 'Información del perfil',
    firstName: 'Nombre',
    lastName: 'Apellido',
    emailAddress: 'Correo electrónico',
    saveChanges: 'Guardar cambios',
    appearance: 'Apariencia',
    themeMode: 'Modo de tema',
    security: 'Seguridad',
    changePassword: 'Cambiar contraseña',
    twoFactor: 'Autenticación de dos factores',
    notifications: 'Notificaciones',
    emailNotifications: 'Notificaciones por correo',
    marketAlerts: 'Alertas de mercado',
    privacy: 'Privacidad',
    publicProfile: 'Perfil público',
    dangerZone: 'Zona de peligro',
    deleteAccount: 'Eliminar cuenta',
  },
  vi: {
    // Navigation
    overview: 'Tổng quan',
    portfolio: 'Danh mục',
    arbitrage: 'Kinh doanh chênh lệch',
    referrals: 'Giới thiệu',
    earnings: 'Thu nhập',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',

    // Dashboard General
    welcomeBack: 'Chào mừng quay trở lại',
    totalBalance: 'Tổng số dư',
    activeInvestments: 'Khoản đầu tư hoạt động',
    dailyEarnings: 'Thu nhập hàng ngày',
    netProfit: 'Lợi nhuận ròng',
    deposit: 'Nạp tiền',
    withdraw: 'Rút tiền',
    addVirtualFunds: 'Thêm tiền ảo',
    triggerRoi: 'Mô phỏng ROI hàng ngày',
    activePlans: 'Gói đầu tư đang hoạt động',
    noActivePlans: 'Không tìm thấy gói hoạt động nào. Hãy nạp tiền hoặc chọn gói để bắt đầu kiếm tiền.',
    dailyYield: 'Lợi suất hàng ngày',
    expiresIn: 'Hết hạn sau',
    days: 'ngày',
    recentTransactions: 'Giao dịch gần đây',
    noTransactions: 'Không tìm thấy giao dịch nào.',
    allRightsReserved: 'Bản quyền đã được bảo hộ.',

    // Arbitrage Page
    selectPlan: 'Chọn gói đầu tư chênh lệch',
    dailyReturn: 'Lợi nhuận hàng ngày',
    duration: 'Thời hạn',
    minDeposit: 'Tiền nạp tối thiểu',
    maxDeposit: 'Tiền nạp tối đa',
    investNow: 'Đầu tư ngay',
    insufficientFunds: 'Số dư không đủ để đầu tư vào gói này.',
    investmentSuccessful: 'Đầu tư thành công!',
    enterAmount: 'Nhập số tiền đầu tư',

    // Referrals Page
    yourReferralCode: 'Mã giới thiệu của bạn',
    totalReferrals: 'Tổng số giới thiệu',
    referredUsers: 'Danh sách người được giới thiệu',
    noReferrals: 'Bạn chưa giới thiệu người dùng nào.',
    commissionEarned: 'Hoa hồng nhận được',

    // Earnings Page
    earningsHistory: 'Lịch sử thu nhập',
    noEarnings: 'Chưa có thu nhập nào được ghi nhận. Kích hoạt gói và chạy mô phỏng ROI.',

    // Settings Page
    accountSettings: 'Cài đặt tài khoản',
    profileInformation: 'Thông tin cá nhân',
    firstName: 'Tên',
    lastName: 'Họ',
    emailAddress: 'Địa chỉ email',
    saveChanges: 'Lưu thay đổi',
    appearance: 'Giao diện',
    themeMode: 'Chế độ giao diện',
    security: 'Bảo mật',
    changePassword: 'Thay đổi mật khẩu',
    twoFactor: 'Xác thực hai yếu tố',
    notifications: 'Thông báo',
    emailNotifications: 'Thông báo qua email',
    marketAlerts: 'Cảnh báo thị trường',
    privacy: 'Quyền riêng tư',
    publicProfile: 'Hồ sơ công khai',
    dangerZone: 'Khu vực nguy hiểm',
    deleteAccount: 'Xóa tài khoản',
  },
  th: {
    // Navigation
    overview: 'ภาพรวม',
    portfolio: 'พอร์ตโฟลิโอ',
    arbitrage: 'ทำกำไรส่วนต่าง',
    referrals: 'การแนะนำ',
    earnings: 'รายได้',
    settings: 'การตั้งค่า',
    logout: 'ออกจากระบบ',

    // Dashboard General
    welcomeBack: 'ยินดีต้อนรับกลับมา',
    totalBalance: 'ยอดคงเหลือทั้งหมด',
    activeInvestments: 'การลงทุนที่ใช้งานอยู่',
    dailyEarnings: 'รายได้ต่อวัน',
    netProfit: 'กำไรสุทธิ',
    deposit: 'ฝากเงิน',
    withdraw: 'ถอนเงิน',
    addVirtualFunds: 'เพิ่มเงินเสมือน',
    triggerRoi: 'จำลอง ROI ประจำวัน',
    activePlans: 'แผนการลงทุนที่ใช้งานอยู่',
    noActivePlans: 'ไม่พบแผนการลงทุนที่ใช้งานอยู่ โปรดฝากเงินหรือเลือกแผนเพื่อเริ่มสร้างรายได้',
    dailyYield: 'ผลตอบแทนรายวัน',
    expiresIn: 'หมดอายุในอีก',
    days: 'วัน',
    recentTransactions: 'ธุรกรรมล่าสุด',
    noTransactions: 'ไม่พบธุรกรรม',
    allRightsReserved: 'สงวนลิขสิทธิ์ทั้งหมด',

    // Arbitrage Page
    selectPlan: 'เลือกแผนการทำกำไรส่วนต่าง',
    dailyReturn: 'ผลตอบแทนรายวัน',
    duration: 'ระยะเวลา',
    minDeposit: 'ฝากขั้นต่ำ',
    maxDeposit: 'ฝากสูงสุด',
    investNow: 'ลงทุนทันที',
    insufficientFunds: 'ยอดคงเหลือไม่เพียงพอสำหรับการลงทุนในแผนนี้',
    investmentSuccessful: 'การลงทุนสำเร็จ!',
    enterAmount: 'ระบุจำนวนเงินลงทุน',

    // Referrals Page
    yourReferralCode: 'รหัสแนะนำของคุณ',
    totalReferrals: 'จำนวนการแนะนำทั้งหมด',
    referredUsers: 'รายชื่อผู้ใช้ที่แนะนำ',
    noReferrals: 'คุณยังไม่ได้แนะนำผู้ใช้ใดๆ',
    commissionEarned: 'ค่าคอมมิชชั่นที่ได้รับ',

    // Earnings Page
    earningsHistory: 'ประวัติรายได้',
    noEarnings: 'ยังไม่มีประวัติรายได้ เปิดใช้งานแผนและจำลอง ROI ประจำวันเพื่อเริ่มต้น',

    // Settings Page
    accountSettings: 'ตั้งค่าบัญชี',
    profileInformation: 'ข้อมูลส่วนตัว',
    firstName: 'ชื่อจริง',
    lastName: 'นามสกุล',
    emailAddress: 'ที่อยู่อีเมล',
    saveChanges: 'บันทึกการเปลี่ยนแปลง',
    appearance: 'รูปลักษณ์',
    themeMode: 'โหมดธีม',
    security: 'ความปลอดภัย',
    changePassword: 'เปลี่ยนรหัสผ่าน',
    twoFactor: 'การยืนยันตัวตนสองระดับ',
    notifications: 'การแจ้งเตือน',
    emailNotifications: 'แจ้งเตือนทางอีเมล',
    marketAlerts: 'แจ้งเตือนตลาด',
    privacy: 'ความเป็นส่วนตัว',
    publicProfile: 'โปรไฟล์สาธารณะ',
    dangerZone: 'โซนอันตราย',
    deleteAccount: 'ลบบัญชี',
  },
  pt: {
    // Navigation
    overview: 'Visão Geral',
    portfolio: 'Portfólio',
    arbitrage: 'Arbitragem',
    referrals: 'Indicações',
    earnings: 'Ganhos',
    settings: 'Configurações',
    logout: 'Sair',

    // Dashboard General
    welcomeBack: 'Bem-vindo de volta',
    totalBalance: 'Saldo Total',
    activeInvestments: 'Investimentos Ativos',
    dailyEarnings: 'Ganhos Diários',
    netProfit: 'Lucro Líquido',
    deposit: 'Depositar',
    withdraw: 'Retirar',
    addVirtualFunds: 'Adicionar Fundos Virtuais',
    triggerRoi: 'Simular ROI Diário',
    activePlans: 'Planos de Investimento Ativos',
    noActivePlans: 'Nenhum plano ativo encontrado. Deposite ou escolha um plano de arbitragem para começar a ganhar.',
    dailyYield: 'Rendimento Diário',
    expiresIn: 'Expira em',
    days: 'dias',
    recentTransactions: 'Transações Recentes',
    noTransactions: 'Nenhuma transação encontrada.',
    allRightsReserved: 'Todos os direitos reservados.',

    // Arbitrage Page
    selectPlan: 'Selecione um Plano de Arbitragem',
    dailyReturn: 'Retorno Diário',
    duration: 'Duração',
    minDeposit: 'Depósito Mín.',
    maxDeposit: 'Depósito Máx.',
    investNow: 'Investir Agora',
    insufficientFunds: 'Saldo insuficiente para investir neste plano.',
    investmentSuccessful: 'Investimento realizado com sucesso!',
    enterAmount: 'Insira o Valor do Investimento',

    // Referrals Page
    yourReferralCode: 'Seu Código de Indicação',
    totalReferrals: 'Total de Indicações',
    referredUsers: 'Lista de Usuários Indicados',
    noReferrals: 'Você ainda não indicou nenhum usuário.',
    commissionEarned: 'Comissão Ganha',

    // Earnings Page
    earningsHistory: 'Histórico de Ganhos',
    noEarnings: 'Nenhum ganho registrado ainda. Ative um plano e simule o ROI diário.',

    // Settings Page
    accountSettings: 'Configurações da Conta',
    profileInformation: 'Informações do Perfil',
    firstName: 'Nome',
    lastName: 'Sobrenome',
    emailAddress: 'Endereço de E-mail',
    saveChanges: 'Salvar Alterações',
    appearance: 'Aparência',
    themeMode: 'Modo de Tema',
    security: 'Segurança',
    changePassword: 'Alterar Senha',
    twoFactor: 'Autenticação de Dois Fatores',
    notifications: 'Notificações',
    emailNotifications: 'Notificações por E-mail',
    marketAlerts: 'Alertas de Mercado',
    privacy: 'Privacidade',
    publicProfile: 'Perfil Público',
    dangerZone: 'Zona de Perigo',
    deleteAccount: 'Excluir Conta',
  },
  ko: {
    // Navigation
    overview: '개요',
    portfolio: '포트폴리오',
    arbitrage: '차익 거래',
    referrals: '추천인',
    earnings: '수익 내역',
    settings: '설정',
    logout: '로그아웃',

    // Dashboard General
    welcomeBack: '돌아온 것을 환영합니다',
    totalBalance: '총 잔고',
    activeInvestments: '활성 투자금',
    dailyEarnings: '일일 수익',
    netProfit: '순이익',
    deposit: '입금하기',
    withdraw: '출금하기',
    addVirtualFunds: '가상 자금 추가',
    triggerRoi: '일일 ROI 시뮬레이션',
    activePlans: '활성화된 투자 플랜',
    noActivePlans: '활성화된 플랜이 없습니다. 입금하거나 차익 거래 플랜을 선택하여 수익 창출을 시작하세요.',
    dailyYield: '일일 수익률',
    expiresIn: '만료 예정일',
    days: '일',
    recentTransactions: '최근 거래 내역',
    noTransactions: '거래 내역이 없습니다.',
    allRightsReserved: '모든 권리 보유.',

    // Arbitrage Page
    selectPlan: '차익 거래 플랜 선택',
    dailyReturn: '일일 수익률',
    duration: '기간',
    minDeposit: '최소 입금액',
    maxDeposit: '최대 입금액',
    investNow: '지금 투자하기',
    insufficientFunds: '이 플랜에 투자할 잔액이 부족합니다.',
    investmentSuccessful: '투자가 성공적으로 완료되었습니다!',
    enterAmount: '투자 금액 입력',

    // Referrals Page
    yourReferralCode: '내 추천 코드',
    totalReferrals: '총 추천 수',
    referredUsers: '추천 가입자 목록',
    noReferrals: '아직 추천한 사용자가 없습니다.',
    commissionEarned: '획득한 수수료',

    // Earnings Page
    earningsHistory: '수익 히스토리',
    noEarnings: '아직 기록된 수익이 없습니다. 플랜을 활성화하고 일일 ROI를 시뮬레이션해 보세요.',

    // Settings Page
    accountSettings: '계정 설정',
    profileInformation: '프로필 정보',
    firstName: '이름',
    lastName: '성',
    emailAddress: '이메일 주소',
    saveChanges: '변경사항 저장',
    appearance: '화면 설정',
    themeMode: '테마 모드',
    security: '보안',
    changePassword: '비밀번호 변경',
    twoFactor: '2단계 인증',
    notifications: '알림',
    emailNotifications: '이메일 알림',
    marketAlerts: '시장 경보',
    privacy: '개인정보 보호',
    publicProfile: '프로필 공개',
    dangerZone: '위험 지역',
    deleteAccount: '계정 삭제',
  },
  fr: {
    // Navigation
    overview: 'Aperçu',
    portfolio: 'Portefeuille',
    arbitrage: 'Arbitrage',
    referrals: 'Parrainages',
    earnings: 'Gains',
    settings: 'Paramètres',
    logout: 'Déconnexion',

    // Dashboard General
    welcomeBack: 'Bon retour',
    totalBalance: 'Solde total',
    activeInvestments: 'Investissements actifs',
    dailyEarnings: 'Gains quotidiens',
    netProfit: 'Bénéfice net',
    deposit: 'Déposer',
    withdraw: 'Retirer',
    addVirtualFunds: 'Ajouter des fonds virtuels',
    triggerRoi: 'Simuler le ROI quotidien',
    activePlans: 'Plans d’investissement actifs',
    noActivePlans: 'Aucun plan actif trouvé. Déposez ou choisissez un plan d’arbitrage pour commencer à gagner.',
    dailyYield: 'Rendement quotidien',
    expiresIn: 'Expire dans',
    days: 'jours',
    recentTransactions: 'Transactions récentes',
    noTransactions: 'Aucune transaction trouvée.',
    allRightsReserved: 'Tous droits réservés.',

    // Arbitrage Page
    selectPlan: 'Sélectionnez un plan d’arbitrage',
    dailyReturn: 'Retour quotidien',
    duration: 'Durée',
    minDeposit: 'Dépôt min',
    maxDeposit: 'Dépôt max',
    investNow: 'Investir maintenant',
    insufficientFunds: 'Solde insuffisant pour investir dans ce plan.',
    investmentSuccessful: 'Investissement réussi !',
    enterAmount: 'Entrez le montant de l’investissement',

    // Referrals Page
    yourReferralCode: 'Votre code de parrainage',
    totalReferrals: 'Total des parrainages',
    referredUsers: 'Liste des utilisateurs parrainés',
    noReferrals: 'Vous n’avez pas encore parrainé d’utilisateurs.',
    commissionEarned: 'Commission gagnée',

    // Earnings Page
    earningsHistory: 'Historique des gains',
    noEarnings: 'Aucun gain enregistré pour le moment. Activez un plan et simulez le ROI quotidien.',

    // Settings Page
    accountSettings: 'Paramètres du compte',
    profileInformation: 'Informations du profil',
    firstName: 'Prénom',
    lastName: 'Nom',
    emailAddress: 'Adresse e-mail',
    saveChanges: 'Enregistrer les modifications',
    appearance: 'Apparence',
    themeMode: 'Mode de thème',
    security: 'Sécurité',
    changePassword: 'Changer le mot de passe',
    twoFactor: 'Authentification à deux facteurs',
    notifications: 'Notifications',
    emailNotifications: 'Notifications par e-mail',
    marketAlerts: 'Alertes de marché',
    privacy: 'Confidentialité',
    publicProfile: 'Profil public',
    dangerZone: 'Zone de danger',
    deleteAccount: 'Supprimer le compte',
  },
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('vexta_lang') as Language | null;
    if (saved && Object.keys(translations).includes(saved)) {
      setLanguageState(saved);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) setLanguageState('es');
      else if (browserLang.startsWith('vi')) setLanguageState('vi');
      else if (browserLang.startsWith('th')) setLanguageState('th');
      else if (browserLang.startsWith('pt')) setLanguageState('pt');
      else if (browserLang.startsWith('ko')) setLanguageState('ko');
      else if (browserLang.startsWith('fr')) setLanguageState('fr');
      else setLanguageState('en');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vexta_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

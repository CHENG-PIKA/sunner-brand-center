export type LogoScene = {
  id: string;
  title: string;
  english: string;
  backdrop: 'ink' | 'green' | 'image';
  description: string;
  usage: string;
  guideTitle: string;
  guideNote: string;
  rules: { title: string; text: string }[];
};

// Uses the user's original white Sunner mark. Backgrounds demonstrate applications,
// not independently approved logo variants or formal brand color specifications.
export const logoScenes: LogoScene[] = [
  {
    id: 'dark', title: '深色底应用', english: 'On dark surfaces', backdrop: 'ink',
    description: '圣农白色标识 · 深色背景示意', usage: '深色版面与留白',
    guideTitle: '让标识，自然成为视觉中心',
    guideNote: '保留原图比例与完整轮廓，在标识四周留出清晰、安静的空间',
    rules: [
      { title: '保持原始比例', text: '整体等比缩放，不拉伸、不压扁，不改变笔画关系' },
      { title: '留出独立空间', text: '文字、图形和边缘应避开标识周围；安全距离以正式 VI 为准' },
      { title: '保持清晰对比', text: '白色标识用于具有足够对比度的深色区域，避免模糊边缘' },
    ],
  },
  {
    id: 'color', title: '色彩底应用', english: 'On color surfaces', backdrop: 'green',
    description: '圣农白色标识 · 辅助色背景示意', usage: '纯色版面与对比',
    guideTitle: '让色彩衬托，保持标识本色',
    guideNote: '白色标识完整呈现于纯色区域，使用干净的背景保持一致的品牌识别',
    rules: [
      { title: '保留标识原色', text: '不在标识中填充渐变、纹理或其他图案，不随背景重新着色' },
      { title: '背景保持统一', text: '避免多种色块穿过标识，让轮廓与笔画关系清晰可见' },
      { title: '确认正式配色', text: '此处 #71B32C 是平台辅助色示意；正式物料背景色以集团 VI 为准' },
    ],
  },
  {
    id: 'photo', title: '影像底应用', english: 'On photography', backdrop: 'image',
    description: '圣农白色标识 · 场景影像示意', usage: '影像版面与位置',
    guideTitle: '让品牌，在画面里清晰呼吸',
    guideNote: '优先选择层次安静、明暗稳定的背景区域，避免干扰标识的可读性',
    rules: [
      { title: '避开复杂区域', text: '不要将标识置于人脸、密集纹理、强反光或主体细节之上' },
      { title: '先调整背景', text: '对比不足时调整位置或背景明暗，不为标识添加描边与发光' },
      { title: '检查完整画面', text: '不同尺寸下均需保留完整标识与周边留白，不贴边、不裁切' },
    ],
  },
];

export const navigation = [
  { id: 'home', name: '首页' },
  { id: 'logo', name: 'LOGO 展示' },
  { id: 'vi', name: 'VI 应用' },
  { id: 'ip', name: 'IP 形象' },
];

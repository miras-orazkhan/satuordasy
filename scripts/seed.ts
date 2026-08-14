/**
 * Seed script — populates DB with admin/manager users and two demo ЖК projects.
 * Run: `bun run db:seed`
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- Users ---
  const adminPass = await bcrypt.hash('admin123', 10);
  const managerPass = await bcrypt.hash('manager123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zhk.local' },
    update: {},
    create: {
      email: 'admin@zhk.local',
      name: 'Администратор',
      passwordHash: adminPass,
      role: 'admin',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@zhk.local' },
    update: {},
    create: {
      email: 'manager@zhk.local',
      name: 'Менеджер',
      passwordHash: managerPass,
      role: 'manager',
    },
  });

  console.log('✓ Users:', admin.email, manager.email);

  // --- Settings ---
  await prisma.setting.upsert({
    where: { key: 'brandName' },
    update: {},
    create: { key: 'brandName', value: 'Vela Estates' },
  });
  await prisma.setting.upsert({
    where: { key: 'robotsAllowAll' },
    update: {},
    create: { key: 'robotsAllowAll', value: 'true' },
  });
  await prisma.setting.upsert({
    where: { key: 'geoDefaultRegion' },
    update: {},
    create: { key: 'geoDefaultRegion', value: 'Москва' },
  });

  await prisma.privacyPolicy.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      content:
        '# Политика конфиденциальности\n\nНастоящая Политика определяет порядок обработки персональных данных пользователей сайта.\n\n## 1. Общие положения\nОбработка персональных данных осуществляется в соответствии с ФЗ-152 "О персональных данных".\n\n## 2. Состав персональных данных\nОператор обрабатывает имя и контактный телефон пользователя, добровольно предоставленные через формы обратной связи.\n\n## 3. Цели обработки\n- обработка заявок на информацию о жилых комплексах;\n- консультация пользователей;\n- информирование о новых проектах.\n\n## 4. Права пользователя\nПользователь имеет право на доступ, исправление и удаление своих персональных данных, а также на отзыв согласия.\n\n## 5. Меры защиты\nОператор применяет технические и организационные меры для защиты персональных данных.',
    },
  });

  // --- Demo ЖК 1: NOIR (dark, premium) ---
  const noir = await prisma.project.upsert({
    where: { slug: 'vela-tower' },
    update: {},
    create: {
      slug: 'vela-tower',
      title: 'VELA Tower',
      status: 'published',
      themePreset: 'noir',
      fontPreset: 'inter',
      seoTitle: 'VELA Tower — премиальный ЖК в Москве',
      seoDescription:
        'Архитектурная доминанта делового центра. Панорамные виды, авторские интерьеры, приватная инфраструктура.',
      seoKeywords: 'жк премиум, москва, квартиры, пентхаус',
      ogImageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      geoRegion: 'Москва',
      geoCity: 'Москва',
      geoLat: 55.7558,
      geoLng: 37.6173,
    },
  });

  await prisma.heroBlock.upsert({
    where: { projectId: noir.id },
    update: {},
    create: {
      projectId: noir.id,
      title: 'VELA Tower',
      subtitle:
        'Башня, которая переписывает линию горизонта. 64 этажа приватности, света и панорамы города.',
      ctaText: 'Оставить заявку',
      desktopImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=2400&q=85',
      mobileImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    },
  });

  const noirAdvantages = [
    { title: 'Панорамные виды', description: 'Видовые квартиры с 360° обзором Москвы от 30 этажа.', icon: 'Mountain', sortOrder: 0 },
    { title: 'Приватные лифты', description: 'Прямой доступ из лифта в квартиру, без общих коридоров.', icon: 'Lock', sortOrder: 1 },
    { title: 'Авторский lobby', description: 'Лобби-пространство 9 метров с работами современных художников.', icon: 'Sparkles', sortOrder: 2 },
    { title: 'Сервис 5★', description: 'Консьерж-сервис 24/7, ресепшн, бронирование услуг.', icon: 'ConciergeBell', sortOrder: 3 },
  ];
  for (const a of noirAdvantages) {
    await prisma.advantage.create({ data: { ...a, projectId: noir.id } });
  }

  const noirAbout = await prisma.aboutSection.upsert({
    where: { projectId: noir.id },
    update: {},
    create: {
      projectId: noir.id,
      description:
        'VELA Tower — это не просто дом, это новая веха в премиальной архитектуре Москвы. Расположенный в деловом центре, в 5 минутах от Кремля, комплекс объединяет в себе приватность резиденции, сервис отеля уровня 5 звёзд и продуманные планировки, разработанные бюро Foster + Partners. 64 этажа, 128 резиденций, площадь квартир от 64 до 480 м².',
      mapEmbedUrl: 'https://yandex.ru/map-widget/v1/?ll=37.617300%2C55.755800&z=14',
      mapLat: 55.7558,
      mapLng: 37.6173,
    },
  });

  const noirNearby = [
    { name: 'м. Охотный ряд', distance: '5 мин пешком', sortOrder: 0 },
    { name: 'Кремль', distance: '8 мин пешком', sortOrder: 1 },
    { name: 'Парк Зарядье', distance: '10 мин пешком', sortOrder: 2 },
    { name: 'Большой театр', distance: '12 мин пешком', sortOrder: 3 },
  ];
  for (const n of noirNearby) {
    await prisma.nearbyObject.create({ data: { ...n, aboutId: noirAbout.id } });
  }

  const noirGallery = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=85',
    'https://images.unsplash.com/photo-1448630360428-65456885c650?w=1600&q=85',
    'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1600&q=85',
    'https://images.unsplash.com/photo-1496564203457-11bb12075d90?w=1600&q=85',
  ];
  for (const [i, url] of noirGallery.entries()) {
    await prisma.galleryImage.create({
      data: { projectId: noir.id, url, sortOrder: i, caption: i === 0 ? 'Главный фасад' : null },
    });
  }

  const noirCat1 = await prisma.floorPlanCategory.create({
    data: { projectId: noir.id, name: 'Резиденции', sortOrder: 0 },
  });
  const noirCat2 = await prisma.floorPlanCategory.create({
    data: { projectId: noir.id, name: 'Пентхаусы', sortOrder: 1 },
  });
  await prisma.floorPlanUnit.createMany({
    data: [
      { categoryId: noirCat1.id, name: '1-комнатная', area: 64.5, sortOrder: 0 },
      { categoryId: noirCat1.id, name: '2-комнатная', area: 98.2, sortOrder: 1 },
      { categoryId: noirCat1.id, name: '3-комнатная', area: 142.0, sortOrder: 2 },
      { categoryId: noirCat2.id, name: 'Sky Penthouse', area: 286.0, sortOrder: 0 },
      { categoryId: noirCat2.id, name: 'Tower Penthouse', area: 480.0, sortOrder: 1 },
    ],
  });

  const noirInteriors = [
    { imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=85', caption: 'Гостиная', sortOrder: 0 },
    { imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85', caption: 'Кухня-столовая', sortOrder: 1 },
    { imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=85', caption: 'Спальня', sortOrder: 2 },
  ];
  for (const intr of noirInteriors) {
    await prisma.interiorItem.create({ data: { ...intr, projectId: noir.id } });
  }

  await prisma.catalog.upsert({
    where: { projectId: noir.id },
    update: {},
    create: {
      projectId: noir.id,
      fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      fileName: 'vela-tower-catalog-2025.pdf',
    },
  });

  // --- Demo ЖК 2: SAND (light, warm) ---
  const sand = await prisma.project.upsert({
    where: { slug: 'meridian-park' },
    update: {},
    create: {
      slug: 'meridian-park',
      title: 'Meridian Park',
      status: 'published',
      themePreset: 'sand',
      fontPreset: 'manrope',
      seoTitle: 'Meridian Park — семейный ЖК у парка',
      seoDescription:
        'Комфорт-класс в окружении природы. Школы, детские сады, парки — всё в шаговой доступности.',
      seoKeywords: 'жк комфорт класс, семья, парк, школа',
      ogImageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80',
      geoRegion: 'Москва',
      geoCity: 'Москва',
      geoLat: 55.7617,
      geoLng: 37.6067,
    },
  });

  await prisma.heroBlock.upsert({
    where: { projectId: sand.id },
    update: {},
    create: {
      projectId: sand.id,
      title: 'Meridian Park',
      subtitle:
        'Семейный квартал у парка. 12 корпусов, 4 школы, набережная и зелёные дворы без машин.',
      ctaText: 'Узнать о проекте',
      desktopImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=2400&q=85',
      mobileImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80',
    },
  });

  const sandAdvantages = [
    { title: 'Двор без машин', description: 'Полностью пешеходная территория с детскими площадками.', icon: 'Trees', sortOrder: 0 },
    { title: '4 школы рядом', description: 'Частные и государственные школы в радиусе 500 метров.', icon: 'GraduationCap', sortOrder: 1 },
    { title: 'Набережная', description: '400 метров собственного благоустройства вдоль реки.', icon: 'Waves', sortOrder: 2 },
    { title: 'Тёплый паркинг', description: 'Подземный паркинг с доступом на лифте прямо в квартиру.', icon: 'Car', sortOrder: 3 },
  ];
  for (const a of sandAdvantages) {
    await prisma.advantage.create({ data: { ...a, projectId: sand.id } });
  }

  const sandAbout = await prisma.aboutSection.upsert({
    where: { projectId: sand.id },
    update: {},
    create: {
      projectId: sand.id,
      description:
        'Meridian Park — это квартал нового поколения для семей, в котором природа, образование и современная архитектура существуют в балансе. 12 корпусов переменной этажности, обеспечивающих инсоляцию квартир и приватность дворов. Площадь квартир от 32 до 145 м², высота потолков 3.0 м.',
      mapEmbedUrl: 'https://yandex.ru/map-widget/v1/?ll=37.606700%2C55.761700&z=14',
      mapLat: 55.7617,
      mapLng: 37.6067,
    },
  });

  const sandNearby = [
    { name: 'Парк Сокольники', distance: '7 мин пешком', sortOrder: 0 },
    { name: 'Школа № 109', distance: '3 мин пешком', sortOrder: 1 },
    { name: 'Детский сад', distance: '4 мин пешком', sortOrder: 2 },
    { name: 'м. Сокольники', distance: '10 мин пешком', sortOrder: 3 },
  ];
  for (const n of sandNearby) {
    await prisma.nearbyObject.create({ data: { ...n, aboutId: sandAbout.id } });
  }

  const sandGallery = [
    'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?w=1600&q=85',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=85',
    'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1600&q=85',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=85',
  ];
  for (const [i, url] of sandGallery.entries()) {
    await prisma.galleryImage.create({
      data: { projectId: sand.id, url, sortOrder: i, caption: i === 0 ? 'Главный фасад' : null },
    });
  }

  const sandCat1 = await prisma.floorPlanCategory.create({
    data: { projectId: sand.id, name: 'Студии', sortOrder: 0 },
  });
  const sandCat2 = await prisma.floorPlanCategory.create({
    data: { projectId: sand.id, name: 'Семейные', sortOrder: 1 },
  });
  await prisma.floorPlanUnit.createMany({
    data: [
      { categoryId: sandCat1.id, name: 'Студия', area: 32.4, sortOrder: 0 },
      { categoryId: sandCat1.id, name: 'Евро-двушка', area: 45.8, sortOrder: 1 },
      { categoryId: sandCat2.id, name: '2-комнатная', area: 64.0, sortOrder: 0 },
      { categoryId: sandCat2.id, name: '3-комнатная', area: 92.5, sortOrder: 1 },
      { categoryId: sandCat2.id, name: '4-комнатная', area: 128.0, sortOrder: 2 },
    ],
  });

  const sandInteriors = [
    { imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=85', caption: 'Семейная гостиная', sortOrder: 0 },
    { imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=85', caption: 'Кухня', sortOrder: 1 },
  ];
  for (const intr of sandInteriors) {
    await prisma.interiorItem.create({ data: { ...intr, projectId: sand.id } });
  }

  await prisma.catalog.upsert({
    where: { projectId: sand.id },
    update: {},
    create: {
      projectId: sand.id,
      fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      fileName: 'meridian-park-catalog-2025.pdf',
    },
  });

  // --- Global social links ---
  const existingSocials = await prisma.socialLink.count();
  if (existingSocials === 0) {
    await prisma.socialLink.createMany({
      data: [
        { platform: 'Telegram', url: 'https://t.me/example', icon: 'Send', sortOrder: 0 },
        { platform: 'Instagram', url: 'https://instagram.com/example', icon: 'Instagram', sortOrder: 1 },
        { platform: 'YouTube', url: 'https://youtube.com/@example', icon: 'Youtube', sortOrder: 2 },
      ],
    });
  }

  console.log('✓ Seeded 2 demo ЖК projects: VELA Tower (noir), Meridian Park (sand)');
  console.log('  Admin:    admin@zhk.local / admin123');
  console.log('  Manager:  manager@zhk.local / manager123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

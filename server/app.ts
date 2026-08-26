import { db, projectInclude } from './db.js';
import { fragmentMessage } from './html.js';
import { homePage, privacyPage, projectPage } from './templates/public.js';
import { cleanText } from './validation.js';
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import { clearSessionCookie, createSessionCookie, readSession, sameOrigin } from './auth.js';
import { dashboard, leadRow, leadsPage, loginPage, newProjectPage, projectEditorPage, projectRow, projectsPage, settingsPage, usersPage } from './templates/admin.js';
import { saveFile } from '../src/lib/storage.js';

const port = Number(process.env.PORT || 3000);
const publicRoot = pathToFileURL(resolve(process.cwd(), 'public') + sep);
const html = (body: string, status = 200, headers: HeadersInit = {}) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', ...headers } });

function asset(pathname: string): Response | null {
  const relative = pathname.replace(/^\/assets\//, '');
  if (!relative || relative.includes('..')) return null;
  const target = relative === 'htmx.min.js' ? pathToFileURL(resolve(process.cwd(), 'node_modules/htmx.org/dist/htmx.min.js')) : new URL(`assets/${relative}`, publicRoot);
  try { return new Response(readFileSync(target), { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }); } catch { return null; }
}

async function setting(key: string, fallback = ''): Promise<string> { return (await db.setting.findUnique({ where: { key }, select: { value: true } }))?.value || fallback; }

async function route(request: Request): Promise<Response> {
  const url = new URL(request.url), path = decodeURIComponent(url.pathname);
  if (path.startsWith('/assets/') && request.method === 'GET') return asset(path) || new Response('Not found', { status: 404 });
  if (path === '/admin/login' && request.method === 'GET') return html(loginPage('', url.searchParams.get('callback') || '/admin'));
  if (path === '/admin/login' && request.method === 'POST') {
    if (!sameOrigin(request)) return new Response('Forbidden', { status: 403 });
    const form = await request.formData(), email = cleanText(form.get('email'), 254).toLowerCase(), password = cleanText(form.get('password'), 200), callback = cleanText(form.get('callback'), 200);
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.passwordHash)) return html(loginPage('Неверный email или пароль', callback), 401);
    return new Response(null, { status: 303, headers: { location: callback.startsWith('/admin') ? callback : '/admin', 'set-cookie': createSessionCookie(user) } });
  }
  if (path === '/admin/logout' && request.method === 'POST') return new Response(null, { status: 303, headers: { location: '/admin/login', 'set-cookie': clearSessionCookie() } });

  if (path.startsWith('/admin')) {
    const user = readSession(request);
    if (!user) return new Response(null, { status: 303, headers: { location: `/admin/login?callback=${encodeURIComponent(path)}` } });
    if (!sameOrigin(request) && request.method !== 'GET') return new Response('Forbidden', { status: 403 });
    if (path === '/admin' && request.method === 'GET') {
      const [projects, published, leads, fresh, recent] = await Promise.all([db.project.count(), db.project.count({ where: { status: 'published' } }), db.lead.count(), db.lead.count({ where: { status: 'new' } }), db.lead.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { project: { select: { title: true } } } })]);
      return html(dashboard(user, { projects, published, leads, fresh }, recent));
    }
    if (path === '/admin/projects' && request.method === 'GET') {
      if (user.role !== 'admin') return new Response('Forbidden', { status: 403 });
      const projects = await db.project.findMany({ include: { _count: { select: { leads: true } } }, orderBy: { updatedAt: 'desc' } }); return html(projectsPage(user, projects));
    }
    if (path === '/admin/projects/new' && request.method === 'GET' && user.role === 'admin') return html(newProjectPage(user));
    if (path === '/admin/projects' && request.method === 'POST' && user.role === 'admin') {
      const form = await request.formData(), title = cleanText(form.get('title'), 160), slug = cleanText(form.get('slug'), 100).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      if (!title || !slug) return html(fragmentMessage('error','Заполните название и slug.'),422);
      try { const project = await db.project.create({ data: { title, slug, status: cleanText(form.get('status'),20) === 'published' ? 'published' : 'draft', seoTitle: cleanText(form.get('seoTitle'),200) || null, seoDescription: cleanText(form.get('seoDescription'),1000) || null } }); return new Response(null,{status:303,headers:{location:`/admin/projects/${project.id}`}}); } catch { return html(fragmentMessage('error','Slug уже занят.'),409); }
    }
    const projectEdit = path.match(/^\/admin\/projects\/([^/]+)$/);
    if (projectEdit && request.method === 'GET' && user.role === 'admin') { const project = await db.project.findUnique({ where:{id:projectEdit[1]}, include:projectInclude }); return project ? html(projectEditorPage(user,project)) : new Response('Not found',{status:404}); }
    const projectSection = path.match(/^\/admin\/projects\/([^/]+)\/(base|hero|about|nearby|advantages|gallery|interiors|catalog|lead-form|socials)$/);
    if (projectSection && request.method === 'POST' && user.role === 'admin') {
      const [projectId, section] = [projectSection[1], projectSection[2]], form = await request.formData(), value = (name:string,max=1000) => cleanText(form.get(name),max), nullable = (name:string,max=1000) => value(name,max) || null, num = (name:string) => { const parsed=Number(value(name)); return Number.isFinite(parsed) ? parsed : null; };
      if (section === 'base') await db.project.update({where:{id:projectId},data:{title:value('title',160),slug:value('slug',100),status:value('status') === 'published' ? 'published':'draft',themePreset:value('themePreset',40)||'noir',fontPreset:value('fontPreset',40)||'inter',seoTitle:nullable('seoTitle',200),seoDescription:nullable('seoDescription',1000),seoKeywords:nullable('seoKeywords',500),ogImageUrl:nullable('ogImageUrl',1000),geoCity:nullable('geoCity',120),geoRegion:nullable('geoRegion',120)}});
      if (section === 'hero') await db.heroBlock.upsert({where:{projectId},create:{projectId,title:value('title',200),subtitle:nullable('subtitle',500),ctaText:value('ctaText',100)||'Оставить заявку',desktopImage:nullable('desktopImage',1000),mobileImage:nullable('mobileImage',1000)},update:{title:value('title',200),subtitle:nullable('subtitle',500),ctaText:value('ctaText',100)||'Оставить заявку',desktopImage:nullable('desktopImage',1000),mobileImage:nullable('mobileImage',1000)}});
      if (section === 'about') await db.aboutSection.upsert({where:{projectId},create:{projectId,description:value('description',5000),mapEmbedUrl:nullable('mapEmbedUrl',2000),mapLat:num('mapLat'),mapLng:num('mapLng')},update:{description:value('description',5000),mapEmbedUrl:nullable('mapEmbedUrl',2000),mapLat:num('mapLat'),mapLng:num('mapLng')}});
      if (section === 'nearby') { const about=await db.aboutSection.findUniqueOrThrow({where:{projectId}});await db.nearbyObject.create({data:{aboutId:about.id,name:value('name',200),distance:value('distance',100),sortOrder:await db.nearbyObject.count({where:{aboutId:about.id}})}}); }
      if (section === 'advantages') await db.advantage.create({data:{projectId,title:value('title',160),description:value('description',1000),icon:nullable('icon',80),sortOrder:await db.advantage.count({where:{projectId}})}});
      if (section === 'gallery') await db.galleryImage.create({data:{projectId,url:value('url',1000),caption:nullable('caption',300),sortOrder:await db.galleryImage.count({where:{projectId}})}});
      if (section === 'interiors') await db.interiorItem.create({data:{projectId,imageUrl:value('imageUrl',1000),caption:nullable('caption',300),description:nullable('description',1000),sortOrder:await db.interiorItem.count({where:{projectId}})}});
      if (section === 'catalog') await db.catalog.upsert({where:{projectId},create:{projectId,fileUrl:value('fileUrl',1000),fileName:nullable('fileName',300)},update:{fileUrl:value('fileUrl',1000),fileName:nullable('fileName',300)}});
      if (section === 'lead-form') await db.leadFormConfig.upsert({where:{projectId},create:{projectId,formType:value('formType')==='bitrix24'?'bitrix24':'native',sectionTitle:nullable('sectionTitle',300),sectionSubtitle:nullable('sectionSubtitle',1000),bitrixPortalId:nullable('bitrixPortalId',100),bitrixFormId:nullable('bitrixFormId',100),bitrixEmbedCode:nullable('bitrixEmbedCode',10000)},update:{formType:value('formType')==='bitrix24'?'bitrix24':'native',sectionTitle:nullable('sectionTitle',300),sectionSubtitle:nullable('sectionSubtitle',1000),bitrixPortalId:nullable('bitrixPortalId',100),bitrixFormId:nullable('bitrixFormId',100),bitrixEmbedCode:nullable('bitrixEmbedCode',10000)}});
      if (section === 'socials') await db.socialLink.create({data:{projectId,platform:value('platform',100),url:value('url',1000),sortOrder:await db.socialLink.count({where:{projectId}})}});
      return html(fragmentMessage('success',section === 'base' || section === 'hero' || section === 'about' || section === 'catalog' || section === 'lead-form' ? 'Сохранено.' : 'Добавлено. Обновите страницу для актуального списка.'));
    }
    const floorCategoryCreate=path.match(/^\/admin\/projects\/([^/]+)\/floor-categories$/);
    if(floorCategoryCreate&&request.method==='POST'&&user.role==='admin'){const form=await request.formData(),projectId=floorCategoryCreate[1];await db.floorPlanCategory.create({data:{projectId,name:cleanText(form.get('name'),200),sortOrder:await db.floorPlanCategory.count({where:{projectId}})}});return html(fragmentMessage('success','Категория добавлена. Обновите страницу.'));}
    const floorUnitCreate=path.match(/^\/admin\/floor-categories\/([^/]+)\/units$/);
    if(floorUnitCreate&&request.method==='POST'&&user.role==='admin'){const form=await request.formData(),categoryId=floorUnitCreate[1],area=Number(cleanText(form.get('area'),30));if(!Number.isFinite(area)||area<=0)return html(fragmentMessage('error','Укажите корректную площадь.'),422);await db.floorPlanUnit.create({data:{categoryId,area,name:cleanText(form.get('name'),200)||null,imageUrl:cleanText(form.get('imageUrl'),1000)||null,sortOrder:await db.floorPlanUnit.count({where:{categoryId}})}});return html(fragmentMessage('success','Планировка добавлена. Обновите страницу.'));}
    const projectAction = path.match(/^\/admin\/projects\/([^/]+)\/(toggle)$/);
    if (projectAction && request.method === 'POST' && user.role === 'admin') {
      const current = await db.project.findUnique({ where: { id: projectAction[1] }, select: { status: true } });
      if (!current) return new Response('', { status: 404 });
      await db.project.update({ where: { id: projectAction[1] }, data: { status: current.status === 'published' ? 'draft' : 'published' } });
      const updated = await db.project.findUniqueOrThrow({ where: { id: projectAction[1] }, include: { _count: { select: { leads: true } } } }); return html(projectRow(updated));
    }
    const projectDelete = path.match(/^\/admin\/projects\/([^/]+)$/);
    if (projectDelete && request.method === 'DELETE' && user.role === 'admin') { await db.project.delete({ where: { id: projectDelete[1] } }); return new Response(null, { status: 200 }); }
    if (path === '/admin/leads' && request.method === 'GET') { const leads = await db.lead.findMany({ include: { project: { select: { title: true, slug: true } } }, orderBy: { createdAt: 'desc' } }); return html(leadsPage(user, leads)); }
    const leadAction = path.match(/^\/admin\/leads\/([^/]+)$/);
    if (leadAction && request.method === 'PATCH') {
      const form = await request.formData(), status = cleanText(form.get('status'), 30);
      if (!['new','in_progress','done','rejected'].includes(status)) return new Response('Bad status', { status: 422 });
      await db.lead.update({ where: { id: leadAction[1] }, data: { status } });
      const lead = await db.lead.findUniqueOrThrow({ where: { id: leadAction[1] }, include: { project: { select: { title: true } } } }); return html(leadRow(lead));
    }
    if (leadAction && request.method === 'DELETE') { await db.lead.delete({ where: { id: leadAction[1] } }); return new Response(null, { status: 200 }); }
    if (path === '/admin/users' && request.method === 'GET' && user.role === 'admin') { const users = await db.user.findMany({ orderBy: { createdAt: 'asc' } }); return html(usersPage(user, users)); }
    if (path === '/admin/upload' && request.method === 'POST' && user.role === 'admin') { const form=await request.formData(),file=form.get('file'); if(!(file instanceof File)||file.size>10*1024*1024)return html(fragmentMessage('error','Выберите файл до 10 МБ.'),422); const saved=await saveFile(file); return html(`<div class="notice notice--success">Загружено: <input value="${saved.url}" readonly></div>`); }
    const contentDelete = path.match(/^\/admin\/content\/(advantage|gallery|interior|social|nearby|floor-category|floor-unit)\/([^/]+)$/);
    if(contentDelete&&request.method==='DELETE'&&user.role==='admin'){ const [,kind,id]=contentDelete; if(kind==='advantage')await db.advantage.delete({where:{id}});if(kind==='gallery')await db.galleryImage.delete({where:{id}});if(kind==='interior')await db.interiorItem.delete({where:{id}});if(kind==='social')await db.socialLink.delete({where:{id}});if(kind==='nearby')await db.nearbyObject.delete({where:{id}});if(kind==='floor-category')await db.floorPlanCategory.delete({where:{id}});if(kind==='floor-unit')await db.floorPlanUnit.delete({where:{id}});return new Response(null,{status:200}); }
    if (path === '/admin/settings' && request.method === 'GET' && user.role === 'admin') { const [rows,home,privacy]=await Promise.all([db.setting.findMany(),db.homePage.findUnique({where:{id:'singleton'}}),db.privacyPolicy.findUnique({where:{id:'singleton'}})]); return html(settingsPage(user,Object.fromEntries(rows.map(x=>[x.key,x.value])),home,privacy?.content||'')); }
    if (path === '/admin/settings' && request.method === 'POST' && user.role === 'admin') { const form=await request.formData(); for(const key of ['brandName','faviconUrl','gtmContainerId','geoDefaultCity','robotsCustomRules']){const value=cleanText(form.get(key),key==='robotsCustomRules'?5000:1000);await db.setting.upsert({where:{key},create:{key,value},update:{value}})} return html(fragmentMessage('success','Настройки сохранены.')); }
    if (path === '/admin/settings/home' && request.method === 'POST' && user.role === 'admin') { const form=await request.formData(),v=(n:string,m=1000)=>cleanText(form.get(n),m)||null;await db.homePage.upsert({where:{id:'singleton'},create:{id:'singleton',title:v('title',200)||'Satu Ordasy',subtitle:v('subtitle'),heroImage:v('heroImage'),logoUrl:v('logoUrl')},update:{title:v('title',200)||'Satu Ordasy',subtitle:v('subtitle'),heroImage:v('heroImage'),logoUrl:v('logoUrl')}});return html(fragmentMessage('success','Главная страница сохранена.')); }
    if (path === '/admin/settings/privacy' && request.method === 'POST' && user.role === 'admin') { const form=await request.formData(),content=cleanText(form.get('content'),50000);await db.privacyPolicy.upsert({where:{id:'singleton'},create:{id:'singleton',content},update:{content}});return html(fragmentMessage('success','Политика сохранена.')); }
    if (path === '/admin/users' && request.method === 'POST' && user.role === 'admin') {
      const form = await request.formData(), email = cleanText(form.get('email'), 254).toLowerCase(), name = cleanText(form.get('name'), 120), password = cleanText(form.get('password'), 200), role = cleanText(form.get('role'), 20);
      if (!email.includes('@') || password.length < 8 || !['admin','manager'].includes(role)) return html(fragmentMessage('error', 'Проверьте поля.'), 422);
      try { await db.user.create({ data: { email, name: name || null, role, passwordHash: await bcrypt.hash(password, 12) } }); return html(fragmentMessage('success', 'Пользователь создан. Обновите страницу, чтобы увидеть его в списке.'), 201); } catch { return html(fragmentMessage('error', 'Пользователь с таким email уже существует.'), 409); }
    }
    const userDelete = path.match(/^\/admin\/users\/([^/]+)$/);
    if (userDelete && request.method === 'DELETE' && user.role === 'admin' && userDelete[1] !== user.id) { await db.user.delete({ where: { id: userDelete[1] } }); return new Response(null, { status: 200 }); }
    return html('<main class="section shell"><h1>Страница админки не найдена</h1></main>', 404);
  }
  if (path === '/' && request.method === 'GET') {
    const [projects, storedHome, brand, socials] = await Promise.all([
      db.project.findMany({ where: { status: 'published' }, select: { slug: true, title: true, seoDescription: true, hero: { select: { desktopImage: true, mobileImage: true, subtitle: true } } }, orderBy: { createdAt: 'desc' } }),
      db.homePage.findUnique({ where: { id: 'singleton' } }), setting('brandName', 'Satu Ordasy'),
      db.socialLink.findMany({ where: { projectId: null }, orderBy: { sortOrder: 'asc' } }),
    ]);
    return html(homePage({ projects, home: storedHome || { title: brand, subtitle: null, heroImage: null, logoUrl: null }, socials }));
  }
  if (path === '/privacy' && request.method === 'GET') {
    const [brand, privacy] = await Promise.all([setting('brandName', 'Satu Ordasy'), db.privacyPolicy.findUnique({ where: { id: 'singleton' } })]);
    return html(privacyPage(brand, privacy?.content || 'Политика конфиденциальности будет опубликована позднее.'));
  }
  const match = path.match(/^\/zhk\/([^/]+)$/);
  if (match && request.method === 'GET') {
    const project = await db.project.findFirst({ where: { slug: match[1], status: 'published' }, include: projectInclude });
    if (!project) return html('<main class="section shell"><h1>Проект не найден</h1></main>', 404);
    const [brand, globals] = await Promise.all([setting('brandName', 'Satu Ordasy'), db.socialLink.findMany({ where: { projectId: null }, orderBy: { sortOrder: 'asc' } })]);
    return html(projectPage(project, brand, globals));
  }
  if (path === '/api/leads' && request.method === 'POST') {
    const form = await request.formData(), projectId = cleanText(form.get('projectId'), 64), name = cleanText(form.get('name'), 120), phone = cleanText(form.get('phone'), 40), comment = cleanText(form.get('comment'), 1000);
    if (name.length < 2 || phone.replace(/\D/g, '').length < 7 || form.get('consent') !== 'yes') return html(fragmentMessage('error', 'Проверьте имя, телефон и согласие с политикой.'), 422);
    const project = await db.project.findFirst({ where: { id: projectId, status: 'published' }, select: { id: true } });
    if (!project) return html(fragmentMessage('error', 'Проект не найден или снят с публикации.'), 404);
    await db.lead.create({ data: { projectId, name, phone, comment: comment || null } });
    return html(fragmentMessage('success', 'Спасибо! Заявка отправлена, менеджер скоро свяжется с вами.'), 201, { 'HX-Trigger': 'leadCreated' });
  }
  return html('<main class="section shell"><h1>Страница не найдена</h1><a href="/">На главную</a></main>', 404);
}

createServer(async (request, response) => {
  try {
    const origin = `http://${request.headers.host || `localhost:${port}`}`;
    const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : Readable.toWeb(request) as ReadableStream;
    const result = await route(new Request(new URL(request.url || '/', origin), { method: request.method, headers: request.headers as HeadersInit, body, duplex: 'half' } as RequestInit));
    response.writeHead(result.status, Object.fromEntries(result.headers));
    if (result.body) Readable.fromWeb(result.body as never).pipe(response); else response.end();
  } catch (error) {
    console.error(error); response.writeHead(500, { 'content-type': 'text/html; charset=utf-8' }); response.end('<h1>Внутренняя ошибка сервера</h1>');
  }
}).listen(port, () => console.log(`HTMX server listening on http://localhost:${port}`));

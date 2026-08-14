import Link from 'next/link';
import { Send, Instagram, Youtube, Linkedin, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';

type Social = { id: string; platform: string; url: string; icon: string | null };

export function FooterSection({
  socials,
  brandName,
  projectTitle,
}: {
  socials: Social[];
  brandName: string;
  projectTitle: string;
}) {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container-premium py-10 md:py-16">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div>
            <p className="text-lg md:text-xl font-semibold tracking-tight">{brandName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Премиальные жилые комплексы
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              © {new Date().getFullYear()} {brandName}. Все права защищены.
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Текущий проект
            </p>
            <p className="text-base font-medium">{projectTitle}</p>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2 inline-block"
            >
              ← Все проекты
            </Link>
          </div>

          {socials.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                Соцсети
              </p>
              <div className="flex items-center gap-3">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    aria-label={s.platform}
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 md:mt-12 pt-6 border-t border-border flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">
            Информация на сайте носит ознакомительный характер и не является публичной офертой.
          </p>
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string | null }) {
  const className = 'h-4 w-4';
  switch (name) {
    case 'Send':
      return <Send className={className} strokeWidth={1.5} />;
    case 'Instagram':
      return <Instagram className={className} strokeWidth={1.5} />;
    case 'Youtube':
      return <Youtube className={className} strokeWidth={1.5} />;
    case 'Linkedin':
      return <Linkedin className={className} strokeWidth={1.5} />;
    case 'Facebook':
      return <Facebook className={className} strokeWidth={1.5} />;
    case 'Twitter':
      return <Twitter className={className} strokeWidth={1.5} />;
    default:
      return <LinkIcon className={className} strokeWidth={1.5} />;
  }
}

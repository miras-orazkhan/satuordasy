import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Send, Instagram, Youtube, Linkedin, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import type { FooterData } from '@/lib/settings';

type Social = { id: string; platform: string; url: string; icon: string | null };

type FooterSectionProps = {
  brandName: string;
  socials: Social[];
  projectTitle?: string;
  showBackToProjects?: boolean;
  footer: FooterData;
};

export function FooterSection({
  brandName,
  socials,
  projectTitle,
  showBackToProjects = false,
  footer,
}: FooterSectionProps) {
  const year = new Date().getFullYear();
  const copyright = footer.copyrightText || `© ${year} ${brandName}. Все права защищены.`;
  const disclaimer = footer.disclaimer || 'Информация на сайте носит ознакомительный характер и не является публичной офертой.';

  // Show contacts column only if any contact field is filled
  const hasContacts = Boolean(footer.phone || footer.email || footer.address || footer.workingHours);
  // Show legal column only if any legal field is filled
  const hasLegal = Boolean(footer.legalName || footer.bin || footer.iik || footer.bankName || footer.bic);

  return (
    <footer className="border-t border-border mt-auto bg-background">
      <div className="container-premium py-10 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {/* Brand + tagline */}
          <div>
            <p className="text-lg md:text-xl font-semibold tracking-tight">{brandName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Премиальные жилые комплексы
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">{copyright}</p>
          </div>

          {/* Contacts */}
          {hasContacts && (
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                Контакты
              </p>
              <ul className="space-y-3 text-sm">
                {footer.phone && (
                  <li>
                    <a
                      href={`tel:${footer.phone.replace(/[^+\d]/g, '')}`}
                      className="flex items-start gap-2 text-foreground hover:text-accent transition-colors"
                    >
                      <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                      <span>{footer.phone}</span>
                    </a>
                  </li>
                )}
                {footer.email && (
                  <li>
                    <a
                      href={`mailto:${footer.email}`}
                      className="flex items-start gap-2 text-foreground hover:text-accent transition-colors"
                    >
                      <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                      <span>{footer.email}</span>
                    </a>
                  </li>
                )}
                {footer.address && (
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <span>{footer.address}</span>
                  </li>
                )}
                {footer.workingHours && (
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <span>{footer.workingHours}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Current project (project pages only) */}
          {showBackToProjects && projectTitle ? (
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
          ) : null}

          {/* Legal info (requisites) */}
          {hasLegal && (
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                Реквизиты
              </p>
              <dl className="space-y-2 text-xs text-muted-foreground">
                {footer.legalName && (
                  <div className="flex gap-2">
                    <dt className="shrink-0">Наим.:</dt>
                    <dd className="text-foreground">{footer.legalName}</dd>
                  </div>
                )}
                {footer.bin && (
                  <div className="flex gap-2">
                    <dt className="shrink-0">БИН:</dt>
                    <dd className="text-foreground font-mono">{footer.bin}</dd>
                  </div>
                )}
                {footer.iik && (
                  <div className="flex gap-2">
                    <dt className="shrink-0">ИИК:</dt>
                    <dd className="text-foreground font-mono break-all">{footer.iik}</dd>
                  </div>
                )}
                {footer.bankName && (
                  <div className="flex gap-2">
                    <dt className="shrink-0">Банк:</dt>
                    <dd className="text-foreground">{footer.bankName}</dd>
                  </div>
                )}
                {footer.bic && (
                  <div className="flex gap-2">
                    <dt className="shrink-0">БИК:</dt>
                    <dd className="text-foreground font-mono">{footer.bic}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Socials */}
          {socials.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                Соцсети
              </p>
              <div className="flex items-center flex-wrap gap-3">
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

        {/* Bottom: disclaimer + privacy link */}
        <div className="mt-8 md:mt-12 pt-6 border-t border-border flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-muted-foreground max-w-3xl">{disclaimer}</p>
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

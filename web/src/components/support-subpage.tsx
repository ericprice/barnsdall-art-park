import Link from 'next/link'
import type {ContentEntry, SiteContent} from '@/lib/content'
import {ParkImage} from './park-image'
import {SectionNavigation} from './section-navigation'
import {PageSections} from './page-sections'
import {QuoteBand} from './quote-band'
import {RichText} from './rich-text'

type Action = {label?: string; href?: string} | null | undefined

function ActionLink({action}: {action: Action}) {
  if (!action?.href || !action.label) return null
  return (
    <Link className="support-action" href={action.href}>
      {action.label}
    </Link>
  )
}

function SupporterDirectory({entry}: {entry: ContentEntry}) {
  return (
    <div className="supporter-years">
      {entry.supporterYears?.map((period, index) => (
        <details
          className="supporter-year"
          key={period._key}
          open={index === 0}
          id={'supporters-' + period._key}
        >
          <summary>
            <span>{period.title}</span>
          </summary>
          <div className="supporter-groups">
            {period.groups?.map((group) => (
              <section key={group._key} aria-label={group.title}>
                <h2>{group.title}</h2>
                <ul className={group.layout === 'logos' ? 'supporter-logos' : 'supporter-names'}>
                  {group.supporters?.map((person) => {
                    const mark = group.layout === 'logos' && person.logo?.asset
                    const content = mark ? (
                      <ParkImage image={person.logo} sizes="(max-width: 44rem) 44vw, 21vw" />
                    ) : (
                      <>
                        {person.name}
                        {person.note && <small>{person.note}</small>}
                      </>
                    )
                    return (
                      <li key={person._key} className={mark ? 'has-logo' : undefined}>
                        {person.url ? (
                          <a href={person.url} aria-label={mark ? person.name : undefined}>
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

function Initiatives({entry}: {entry: ContentEntry}) {
  const cards = entry.initiativeCards || []
  return [false, true].map((completed) => {
    const items = cards.filter((card) => !!card.completed === completed)
    if (!items.length) return null
    return (
      <section
        className={'support-initiatives' + (completed ? ' is-completed' : '')}
        key={String(completed)}
      >
        {completed && <h2>{entry.completedHeading}</h2>}
        <div className="support-card-grid">
          {items.map((card) => (
            <article key={card._key}>
              {!completed && (
                <div className="initiative-shape" data-color={card.color || 'pale-green'}>
                  <ParkImage image={card.image} />
                </div>
              )}
              {card.label && <p className="support-label">{card.label}</p>}
              <h3>{card.title}</h3>
              {card.summary && <p>{card.summary}</p>}
              <ActionLink action={card.link} />
            </article>
          ))}
        </div>
      </section>
    )
  })
}

function Donate({entry}: {entry: ContentEntry}) {
  return (
    <div className="donation-sections">
      {entry.donationSections?.map((section) => (
        <section
          key={section._key}
          className={'donation-section donation-section--' + (section.kind || 'text')}
        >
          {section.kind === 'feature' && (
            <div className="donation-feature-shape">
              <ParkImage image={section.image} priority sizes="75vw" />
            </div>
          )}
          <div className="donation-heading">
            {section.label && <p className="support-label">{section.label}</p>}
            <h2>{section.title}</h2>
          </div>
          {section.summary && <p className="donation-copy">{section.summary}</p>}
          {section.link && (
            <div className="donation-action-wrap">
              <ActionLink action={section.link} />
            </div>
          )}
          {section.kind === 'levels' && entry.givingLevels?.length ? (
            <div className="donation-level-grid">
              {entry.givingLevels.map((level) => (
                <article key={level._key}>
                  <h3>{level.title}</h3>
                  {level.summary && <p>{level.summary}</p>}
                  <ActionLink action={level.link} />
                </article>
              ))}
            </div>
          ) : null}
          {section.kind === 'ways' &&
            section.ways?.map((way) => (
              <article className="giving-method" key={way._key}>
                <h3>{way.title}</h3>
                {way.summary && <p>{way.summary}</p>}
                <ActionLink action={way.link} />
              </article>
            ))}
        </section>
      ))}
    </div>
  )
}

export function SupportSubpage({
  entry,
  site,
  path,
}: {
  entry: ContentEntry
  site: SiteContent
  path: string
}) {
  const department = site.settings.navigation.find((item) => item.href === '/support')
  const introductoryAction = entry.supportLink
  const structured =
    entry.supporterYears ||
    entry.initiativeCards ||
    entry.volunteerOpportunities ||
    entry.donationSections
  return (
    <main id="main-content" className="interior support-subpage">
      <header className="page-heading">
        <h1>{department?.title}</h1>
        <SectionNavigation path={path} settings={site.settings} />
      </header>
      {entry.summary && <p className="support-intro">{entry.summary}</p>}
      {introductoryAction && (
        <div className="support-intro-action">
          <ActionLink action={introductoryAction} />
        </div>
      )}
      <RichText value={entry.body} />
      {entry.supporterYears && <SupporterDirectory entry={entry} />}
      {entry.initiativeCards && <Initiatives entry={entry} />}
      {entry.donationSections && <Donate entry={entry} />}
      {entry.volunteerOpportunities && (
        <div className="support-card-grid volunteer-cards">
          {entry.volunteerOpportunities.map((item) => (
            <article key={item._key}>
              {item.image?.asset && (
                <div className="volunteer-image">
                  <ParkImage image={item.image} />
                </div>
              )}
              <h2>{item.title}</h2>
              {item.summary && <p>{item.summary}</p>}
              <ActionLink action={item.link} />
            </article>
          ))}
        </div>
      )}
      {!!entry.sections?.length && <PageSections sections={entry.sections} />}
      {!structured &&
        entry.givingLevels?.map((level) => (
          <section className="giving-method" key={level._key}>
            <h2>{level.title}</h2>
            <p>{level.summary}</p>
            <ActionLink action={level.link} />
          </section>
        ))}
      <QuoteBand quote={site.home.quote} />
    </main>
  )
}

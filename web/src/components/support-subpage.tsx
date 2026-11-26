import '../styles/_support-subpages.scss'
import type {ContentEntry, SiteSettings} from '@/lib/content'
import {interfaceText} from '../../../shared/interface'
import {Tile} from './tile'
import {EntryLabel} from './entry-meta'
import {FeatureContent} from './feature-content'
import {DotLink, DotLinkContent} from './action-links'
import {ParkImage} from './park-image'
import {PageHeading} from './page-heading'
import {PageSections} from './page-sections'
import {QuoteBand} from './quote-band'
import {RichText} from './rich-text'

type Action = {label?: string; href?: string} | null | undefined

function ActionLink({action}: {action: Action}) {
  if (!action?.href || !action.label) return null
  return <DotLink href={action.href}>{action.label}</DotLink>
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
    const grid = (
      <div className="support-card-grid">
        {items.map((card) => {
          const detail = card.detail
          if (card.page && !detail?.slug) return null
          const href = detail?.slug ? '/' + detail.slug : card.link?.href
          const summary = card.summary || detail?.summary
          return (
            <Tile
              key={card._key}
              className="initiative-tile"
              href={href}
              title={detail?.title || card.title || ''}
              label={card.label || detail?.organization}
              media={
                !completed && (
                  <div
                    className="tile__media initiative-shape"
                    data-color={card.color || 'pale-green'}
                  >
                    <ParkImage image={card.image} />
                  </div>
                )
              }
              caption={
                <>
                  {summary && <p className="tile__summary">{summary}</p>}
                  {href && (
                    <span className="dot-link">
                      <DotLinkContent>
                        {detail ? interfaceText.readMore : card.link?.label}
                      </DotLinkContent>
                    </span>
                  )}
                </>
              }
            />
          )
        })}
      </div>
    )
    return completed ? (
      <details className="support-initiatives is-completed" key="past">
        <summary>
          <span>{entry.completedHeading || 'Past Initiatives'}</span>
        </summary>
        {grid}
      </details>
    ) : (
      <section className="support-initiatives" key="current">
        {grid}
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
          {section.kind === 'feature' ? (
            <>
              <div className="donation-feature-shape">
                <ParkImage image={section.image} priority sizes="75vw" />
              </div>
              <FeatureContent
                label={section.label}
                title={section.title}
                summary={section.summary}
                link={section.link}
              />
            </>
          ) : (
            <>
              <div className="donation-heading">
                <EntryLabel label={section.label} large />
                <h2>{section.title}</h2>
              </div>
              {section.summary && <p className="donation-copy">{section.summary}</p>}
              {section.link && (
                <div className="donation-action-wrap">
                  <ActionLink action={section.link} />
                </div>
              )}
            </>
          )}
          {section.kind === 'levels' && section.levels?.length ? (
            <div className="donation-level-grid">
              {section.levels.map((level) => (
                <Tile key={level._key} title={level.title || ''}>
                  {level.summary && <p>{level.summary}</p>}
                  <ActionLink action={level.link} />
                </Tile>
              ))}
            </div>
          ) : null}
          {section.kind === 'ways' &&
            section.ways?.map((way) => (
              <article className="giving-method" key={way._key}>
                <h3 className="card-heading">{way.title}</h3>
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
  settings,
  path,
}: {
  entry: ContentEntry
  settings: SiteSettings
  path: string
}) {
  const department = settings.navigation.find((item) => item.href === '/support')
  const introductoryAction = entry.supportLink
  return (
    <main id="main-content" className="interior support-subpage">
      <PageHeading
        title={department?.title ?? entry.title}
        subtitle={entry.subtitle}
        navigation={{path, settings}}
      />
      {!!entry.body?.length && (
        <div className="support-copy">
          <RichText value={entry.body} />
        </div>
      )}
      {entry.template === 'supporters' && introductoryAction && (
        <div className="support-intro-action">
          <ActionLink action={introductoryAction} />
        </div>
      )}
      {entry.template === 'supporters' && <SupporterDirectory entry={entry} />}
      {entry.template === 'initiatives' && <Initiatives entry={entry} />}
      {entry.template === 'donate' && <Donate entry={entry} />}
      {!!entry.sections?.length && <PageSections sections={entry.sections} />}
      <QuoteBand />
    </main>
  )
}

import {ParkImage} from './park-image'
import {foundationHeadings} from '../../../shared/foundation'
import type {ContentEntry, Partner} from '@/lib/content'
import styles from './foundation-directory.module.scss'

function People({
  title,
  members,
  staff = false,
}: {
  title: string
  members: ContentEntry['boardMembers']
  staff?: boolean
}) {
  if (!members?.length) return null
  return (
    <div className={styles.group}>
      <h3>{title}</h3>
      <ul className={staff ? styles.staff : styles.board}>
        {members.map((person) => (
          <li key={person._key}>
            <h4>
              {person.profileUrl ? <a href={person.profileUrl}>{person.name}</a> : person.name}
            </h4>
            {person.role && (
              <p>
                <em>{person.role}</em>
              </p>
            )}
            {person.affiliation && <p>{person.affiliation}</p>}
            {person.bio && <p className={styles.bio}>{person.bio}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PartnerMark({partner}: {partner: Partner}) {
  const {logo, name = ''} = partner
  const mark =
    typeof logo === 'string' || logo?.asset ? (
      <ParkImage
        image={logo}
        intrinsicWidth={400}
        fallbackAlt={name}
        sizes="(max-width: 44rem) 35vw, 16vw"
      />
    ) : (
      name
    )
  return partner.website ? (
    <a href={partner.website} aria-label={name}>
      {mark}
    </a>
  ) : (
    mark
  )
}

export function FoundationDirectory({entry}: {entry: ContentEntry}) {
  const headings = foundationHeadings
  return (
    <>
      {(Boolean(entry.boardMembers?.length) || Boolean(entry.staffMembers?.length)) && (
        <section id="leadership" className={styles.directory}>
          <h2>{headings.leadership}</h2>
          <People title={headings.board} members={entry.boardMembers} />
          <People title={headings.staff} members={entry.staffMembers} staff />
        </section>
      )}
      {Boolean(entry.partners?.length) && (
        <section id="partners" className={styles.directory}>
          <h2>{headings.partners}</h2>
          <ul className={styles.partners}>
            {entry.partners?.map((partner) => (
              <li key={partner._key}>
                <PartnerMark partner={partner} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

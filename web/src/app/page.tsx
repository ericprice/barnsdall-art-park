import {connection} from 'next/server'
import {publicOrigin} from '@/lib/site-origin'
import {getHome} from '@/lib/content'
import {Hero, CelebrationBadge} from '@/components/hero'
import {HomeSections} from '@/components/home-sections'

export const metadata = {alternates: {canonical: publicOrigin?.href}}

export default async function Home() {
  // The homepage header includes today's sunset even on the first HTML response.
  await connection()
  const home = await getHome()
  return (
    <main className="home-page" id="main-content">
      {home.slides.length ? (
        <Hero slides={home.slides} />
      ) : (
        <h1 className="sr-only">Barnsdall Art Park</h1>
      )}
      <CelebrationBadge celebration={home.celebration} />
      <HomeSections home={home} />
    </main>
  )
}

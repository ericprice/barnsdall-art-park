import {connection} from 'next/server'
import {getSite} from '@/lib/content'
import {Hero} from '@/components/hero'
import {HomeSections} from '@/components/home-sections'

export default async function Home() {
  // The homepage header includes today's sunset even on the first HTML response.
  await connection()
  const {home, settings} = await getSite()
  return (
    <main className="home-page" id="main-content">
      <Hero slides={home.slides} celebration={home.celebration} />
      <HomeSections quotes={settings.quotes} home={home} />
    </main>
  )
}

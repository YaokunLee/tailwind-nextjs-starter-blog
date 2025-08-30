import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import { MDXLayoutRenderer } from 'pliny/mdx-components'

interface Props {
  author: Omit<Authors, '_id' | '_raw' | 'body'>
  authorBody?: Authors['body']
}

export default function AuthorCard({ author, authorBody }: Props) {
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = author

  return (
    <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:space-y-0 xl:gap-x-8">
      <div className="flex flex-col items-center space-x-2 pt-8">
        {avatar && (
          <Image
            src={avatar}
            alt="avatar"
            width={192}
            height={192}
            className="h-48 w-48 rounded-full"
          />
        )}
        <h3 className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight">{name}</h3>
        <div className="text-gray-500 dark:text-gray-400">{occupation}</div>
        <div className="text-gray-500 dark:text-gray-400">{company}</div>
        <div className="flex space-x-3 pt-6">
          <SocialIcon kind="mail" href={`mailto:${email}`} />
          <SocialIcon kind="github" href={github} />
          <SocialIcon kind="linkedin" href={linkedin} />
          <SocialIcon kind="x" href={twitter} />
          <SocialIcon kind="bluesky" href={bluesky} />
        </div>
      </div>
      {authorBody && (
        <div className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-2">
          <MDXLayoutRenderer code={authorBody.code} />
        </div>
      )}
    </div>
  )
}

'use client'
import { Button } from '@/components/base/button'
import { changeLanguage } from '@/utils/helper'
import { Trans } from '@lingui/react/macro'
import { FC } from 'react'

const HomePage: FC = () => {
    return (
        <div className="flex h-screen w-screen flex-col gap-2">
            <section className="flex items-center gap-4 pt-8 pr-4 pl-4 lg:pl-8 xl:pr-18">
                <Button variant="outline" onClick={() => changeLanguage('zh')}>
                    Chinese
                </Button>
                <Button onClick={() => changeLanguage('en')}>English</Button>
            </section>
            <Trans>Dutch</Trans>
        </div>
    )
}

export default HomePage

import { useEffect, useState } from 'react'

const useIsMount = () => {
    const [isMount, setIsMount] = useState(false)

    useEffect(() => {
        setIsMount(true)
        return () => {
            setIsMount(false)
        }
    }, [])
    return isMount
}

export { useIsMount }

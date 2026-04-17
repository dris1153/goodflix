export const sleep = async (time: number) => {
    return new Promise<void>((resolve) =>
        setTimeout(() => {
            resolve()
        }, time),
    )
}

export const preventInvalidKeys = (e: React.KeyboardEvent<HTMLInputElement>, preventKeys: string[]) => {
    if (!preventKeys.includes(e.key)) return

    e.preventDefault()
}

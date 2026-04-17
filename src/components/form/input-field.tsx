import type { Control, FieldPath, FieldPathValue, FieldValues } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './form'
import { cn } from '@/utils'
import { Input } from '@/components/base/input'
import { Show } from '@/components/base/show'

type InputProps = React.ComponentProps<'input'>

interface Props<T extends FieldValues = FieldValues> extends InputProps {
    control: Control<T>
    name: FieldPath<T>
    defaultValue?: FieldPathValue<T, FieldPath<T>>
    label?: string
    labelClassName?: string
    required?: boolean
    containerClassName?: string
    requiredClassName?: string
}

const InputField = <T extends FieldValues>({
    className,
    labelClassName,
    control,
    defaultValue,
    label,
    required,
    containerClassName,
    requiredClassName,
    ...props
}: Props<T>) => {
    return (
        <FormField
            defaultValue={defaultValue}
            control={control}
            name={props.name}
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <div className={cn(containerClassName)}>
                            <Show when={!!label}>
                                <FormLabel className={labelClassName}>
                                    {label}{' '}
                                    {required && <span className={cn('text-destructive', requiredClassName)}>*</span>}
                                </FormLabel>
                            </Show>
                            <Input {...field} {...props} className={className} />

                            <FormMessage className="text-destructive mt-1 text-xs" />
                        </div>
                    </FormControl>
                </FormItem>
            )}
        />
    )
}

export { InputField }

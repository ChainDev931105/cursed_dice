export interface PrettyAlertInterface {
    open: boolean 
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    text: string
}
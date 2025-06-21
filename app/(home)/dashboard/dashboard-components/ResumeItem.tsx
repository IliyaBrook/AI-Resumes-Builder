'use client'
// components
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Tooltip } from '@/components'
import { useDeleteDocument } from '@/hooks'
import { format } from 'date-fns'
import { Copy, FileText, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FC, useMemo, useState } from 'react'

interface PropType {
	documentId: string;
	title: string;
	themeColor: string | null;
	thumbnail: string | null;
	updatedAt: string;
	onDuplicate?: (documentId: string) => void;
}

const ResumeItem: FC<PropType> = ({
	                                  documentId,
	                                  title,
	                                  themeColor,
	                                  thumbnail,
	                                  updatedAt,
	                                  onDuplicate
                                  }) => {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const { mutate: deleteDocument, isPending } = useDeleteDocument()
	
	const docDate = useMemo(() => {
		if (!updatedAt) return null
		return format(updatedAt, 'MMM dd,yyyy')
	}, [updatedAt])
	
	const gotoDoc = () => {
		router.push(`/dashboard/document/${documentId}/edit`)
	}
	
	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation()
		setOpen(true)
	}
	
	const confirmDelete = (event: React.MouseEvent) => {
		event.stopPropagation()
		deleteDocument(documentId, {
			onSuccess: () => {
				setOpen(false)
			}
		})
	}
	
	const cancelDelete = (event: React.MouseEvent) => {
		event.stopPropagation()
		setOpen(false)
	}
	
	return (
		<>
			<div
				className='
        cursor-pointer max-w-[220px] w-full
        border 
        rounded-lg transition-all h-[220px]
        hover:border-primary
        hover:shadow-md
        shadow-primary
        '
				onClick={gotoDoc}
				style={{ borderColor: themeColor || '' }}
			>
				<div
					className='flex flex-col w-full
          h-full items-center rounded-lg
          justify-center bg-[#fdfdfd] 
          dark:bg-secondary'
				>
					<div
						className='w-full flex flex-1 px-1
         pt-2'
					>
						<div
							className='w-full flex flex-1 bg-white
          dark:bg-gray-700
          rounded-t-lg justify-center
           items-center
          '
						>
							{thumbnail ? (
								<div
									className='
              relative w-full h-full 
              rounded-t-lg
              overflow-hidden
              '
								>
									<Image
										fill
										src={thumbnail}
										alt={title}
										className='w-full h-full
                  object-cover
                  object-top rounded-t-lg
                                  '
									/>
								</div>
							) : (
								<FileText size='30px' />
							)}
						</div>
					</div>
					<div
						className='shrink w-full border-t pt-2 pb-[9px] px-[9px]'
					>
						<Tooltip content={title} side='top'>
							<h5
								className='font-bold text-lg mb-1 truncate block max-w-full text-center cursor-default'
							>
								{title}
							</h5>
						</Tooltip>
						<div className='flex items-center justify-center gap-2'>
							<span className='text-[12px] font-medium text-muted-foreground whitespace-nowrap'>{docDate}</span>
							<button
								className='text-muted-foreground rounded hover:shadow-[0_0_0_1px_#6b7280] p-1'
								onClick={handleDelete}
							>
								<Trash2 size='20px' />
							</button>
							<button
								className='text-muted-foreground rounded hover:shadow-[0_0_0_1px_#6b7280] p-1'
								onClick={e => {
									e.stopPropagation()
									onDuplicate && onDuplicate(documentId)
								}}
							>
								<Copy size='20px' />
							</button>
						</div>
					</div>
				</div>
			</div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Are you sure you want to delete this resume?
						</DialogTitle>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={cancelDelete}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button
							variant='destructive'
							onClick={confirmDelete}
							disabled={isPending}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default ResumeItem

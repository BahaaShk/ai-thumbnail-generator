import { useEffect, useState } from "react"
import SoftBackdrop from "../components/SoftBackdrop"
import { dummyThumbnails, type IThumbnail } from "../assets/assets"

const MyGeneration = () => {

const [thumbnails, setThumbnails] = useState<IThumbnail>([])
const [loading, setLoading] = useState(false)

const fetchThumbnails = async () => {
setThumbnails(dummyThumbnails as unknown as IThumbnail[])
setLoading(false)
}

const handleDownload = (image_url: string) => {
window.open(image_url,'_blank')
}

const handleDelete = async (id: string) => {
  console.log(id);
  
}

useEffect(() => {
fetchThumbnails()
}, [])


  return (
    <>
    <SoftBackdrop />
    <div className=" mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
      {/* header  */}

      <div className=" mb-8">
        <h1 className=" text-2xl font-bold text-zinc-200">My Generations</h1>
        <p className=" text-sm mt-1 text-zinc-400">View and manage your AI-generated thumbnails</p>
      </div>

      {/* loading */}
      {
        loading && (
          <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
{Array.from({length:6}).map((_,i) => (
  <div className=" rounded-2xl bg-white/5 border border-white/10 animate-pulse h-[260px]" key={i}/>
))}
          </div>
        )
      }
    </div>
    </>
  )
}

export default MyGeneration
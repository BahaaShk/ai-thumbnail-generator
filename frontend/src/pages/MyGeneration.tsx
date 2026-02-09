import SoftBackdrop from "../components/SoftBackdrop"

const MyGeneration = () => {
  return (
    <>
    <SoftBackdrop />
    <div className=" mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
      {/* header  */}

      <div className=" mb-8">
        <h1 className=" text-2xl font-bold text-zinc-200">My Generations</h1>
        <p className=" text-sm mt-1 text-zinc-400">View and manage your AI-generated thumbnails</p>
      </div>
    </div>
    </>
  )
}

export default MyGeneration
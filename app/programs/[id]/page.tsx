import { getSavedProgramById } from '@/lib/db/queries';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Briefcase,
  CalendarDays,
  Info,
  LinkIcon,
  ListChecks,
  MapPin,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
} from 'lucide-react';
import { auth } from '@/app/(auth)/auth';

const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1700&q=80';

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
  const programId = awaitedParams.id;

  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }
  const userId = session.user.id;

  const program = await getSavedProgramById({ id: programId, userId: userId });

  if (!program) {
    notFound();
  }

  const heroImageUrl = (program.imageUrls as string[])?.[0] || DEFAULT_IMAGE_URL;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div
        className="relative h-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-8">
          <div className="container mx-auto">
            <Link href="/" className="text-sm text-white hover:underline mb-2 inline-block bg-black bg-opacity-30 px-3 py-1 rounded-md">
              &larr; Back to My Programs
            </Link>
            <h1 className="text-4xl font-bold text-white">{program.universityName}</h1>
            <p className="text-xl text-gray-200 flex items-center">
              <MapPin size={20} className="mr-2" />
              {program.universityName.split(',').pop()?.trim() || 'N/A'}
            </p>
            <p className="text-2xl text-gray-100 mt-1">{program.programName}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto py-8 px-4 md:px-0">
        {/* Tabs - Simplified */}
        <div className="mb-6 border-b border-gray-300">
          <nav className="flex space-x-8 -mb-px">
            <button className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-blue-600 border-blue-600">
              <Info size={16} className="inline mr-1.5" /> Overview
            </button>
            <button className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
              <ListChecks size={16} className="inline mr-1.5" /> Requirements
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Program Overview */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Program Overview</h2>
            <div className="prose max-w-none text-gray-700">
              <p>{program.overview}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Program Highlights:</h3>
              <div className="flex flex-wrap gap-2">
                {program.highlight1 && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{program.highlight1}</span>}
                {program.highlight2 && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{program.highlight2}</span>}
                {program.highlight3 && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">{program.highlight3}</span>}
              </div>
            </div>
            
            <div className="mt-8">
              <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Link href={program.officialLink || '#'} target="_blank" rel="noopener noreferrer">
                  <LinkIcon size={16} className="mr-2" /> Visit Official Program Page
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Key Info & Requirements */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Information</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <Clock size={18} className="mr-3 text-blue-500" />
                  <strong>Duration:</strong> <span className="ml-auto">{program.duration}</span>
                </li>
                <li className="flex items-center">
                  <DollarSign size={18} className="mr-3 text-green-500" />
                  <strong>Est. Cost:</strong> <span className="ml-auto">{program.costHint}</span>
                </li>
                <li className="flex items-center">
                  <CalendarDays size={18} className="mr-3 text-red-500" />
                  <strong>Deadline Hint:</strong> <span className="ml-auto">{program.deadlineHint}</span>
                </li>
                 <li className="flex items-center">
                  <TrendingUp size={18} className="mr-3 text-purple-500" />
                  <strong>Match Score:</strong> <span className="ml-auto font-semibold">{program.matchScore !== null ? `${program.matchScore}%` : 'N/A'}</span>
                </li>
                 <li className="flex items-center">
                  <Star size={18} className="mr-3 text-yellow-500" />
                  <strong>Choice Type:</strong> <span className="ml-auto">{program.choiceType || 'N/A'}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Core Requirements</h3>
                 <ul className="space-y-2 text-sm text-gray-700">
                    <li><strong>GPA:</strong> {program.gpaRequirement || 'N/A'}</li>
                    <li><strong>GRE:</strong> {program.greRequirement || 'N/A'}</li>
                    <li><strong>TOEFL:</strong> {program.toeflRequirement || 'N/A'}</li>
                    <li><strong>IELTS:</strong> {program.ieltsRequirement || 'N/A'}</li>
                    {program.requirementsSummary && <li className="mt-2 pt-2 border-t"><strong>Summary:</strong> {program.requirementsSummary}</li>}
                </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 
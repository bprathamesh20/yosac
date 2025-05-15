import { auth } from '@/app/(auth)/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getStudentProfileByUserId, getUserById } from '@/lib/db/queries';
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  LineChart,
  School,
  Target,
} from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function StudentProfilePage () {
  // This would be fetched from your database in a real application

  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const profile = await getStudentProfileByUserId({ userId: session.user.id });
  const user = await getUserById({ id: session.user.id });

  if (!profile || !user) {
    redirect('/onboarding');
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="grid gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage
              src="/placeholder.svg?height=96&width=96"
              alt={user[0].email}
            />
            <AvatarFallback className="text-3xl">
              {user[0].email
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-3xl font-bold">{user[0].email}</h1>
              <Badge className="w-fit bg-emerald-600 hover:bg-emerald-700">
                Graduate Applicant
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{profile.targetMajor}</span>
              </div>
              <div className="flex items-center gap-1">
                <School className="h-4 w-4" />
                <span>{profile.college}</span>
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                <span>{profile.undergradMajor}</span>
              </div>
            </div>

            <p className="text-muted-foreground">
              Targeting {profile.targetMajor} program for {profile.targetTerm}{' '}
              admission
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Academic Information
              </CardTitle>
              <CardDescription>Undergraduate details and GPA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Undergraduate Major
                  </span>
                  <span className="font-medium">{profile.undergradMajor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Major</span>
                  <span className="font-medium">{profile.targetMajor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Term</span>
                  <span className="font-medium">{profile.targetTerm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">College</span>
                  <span className="font-medium">{profile.college}</span>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGPA</span>
                    <span className="font-medium">{profile.cgpa}/4.0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Test Scores
              </CardTitle>
              <CardDescription>Standardized test results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">
                      GRE Quantitative
                    </span>
                    <span className="font-medium">
                      {profile.greQuantScore}/170
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">GRE Verbal</span>
                    <span className="font-medium">
                      {profile.greVerbalScore}/170
                    </span>
                  </div>
                  
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">
                      GRE Analytical Writing
                    </span>
                    <span className="font-medium">
                      {profile.greAwaScore}/6.0
                    </span>
                  </div>
                  
                </div>

                <Separator className="my-2" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground block text-sm">
                      TOEFL
                    </span>
                    <span className="font-medium text-lg">
                      {profile.toeflScore}/120
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-sm">
                      IELTS
                    </span>
                    <span className="font-medium text-lg">
                      {profile.ielts}/9.0
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Experience */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Experience
              </CardTitle>
              <CardDescription>
                Work experience and publications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-3 rounded-full">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Work Experience</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          {profile.workExpMonths}
                        </span>
                        <span className="text-muted-foreground">months</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {typeof profile.workExpMonths === 'number' && profile.workExpMonths > 0
                          ? `${Math.floor(profile.workExpMonths / 12)} years, ${profile.workExpMonths % 12} months`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-3 rounded-full">
                      <LineChart className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Publications</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          {profile.publications}
                        </span>
                        <span className="text-muted-foreground">
                          published papers
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Academic and research publications
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

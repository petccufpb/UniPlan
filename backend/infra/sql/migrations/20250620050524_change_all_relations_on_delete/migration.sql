-- DropForeignKey
ALTER TABLE "UniversityCourse" DROP CONSTRAINT "UniversityCourse_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "UniversityCurriculum" DROP CONSTRAINT "UniversityCurriculum_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "UniversityDepartment" DROP CONSTRAINT "UniversityDepartment_universityId_fkey";

-- DropForeignKey
ALTER TABLE "UniversityRequest" DROP CONSTRAINT "UniversityRequest_curriculumId_fkey";

-- DropForeignKey
ALTER TABLE "UniversityRequest" DROP CONSTRAINT "UniversityRequest_universityId_fkey";

-- DropForeignKey
ALTER TABLE "UniversityTerm" DROP CONSTRAINT "UniversityTerm_universityId_fkey";

-- DropForeignKey
ALTER TABLE "UniversityTermCourse" DROP CONSTRAINT "UniversityTermCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "UniversityTermCourse" DROP CONSTRAINT "UniversityTermCourse_termId_fkey";

-- AddForeignKey
ALTER TABLE "UniversityCourse" ADD CONSTRAINT "UniversityCourse_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "UniversityDepartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityCurriculum" ADD CONSTRAINT "UniversityCurriculum_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "UniversityDepartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityDepartment" ADD CONSTRAINT "UniversityDepartment_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityRequest" ADD CONSTRAINT "UniversityRequest_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityRequest" ADD CONSTRAINT "UniversityRequest_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "UniversityCurriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityTerm" ADD CONSTRAINT "UniversityTerm_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityTermCourse" ADD CONSTRAINT "UniversityTermCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "UniversityCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityTermCourse" ADD CONSTRAINT "UniversityTermCourse_termId_fkey" FOREIGN KEY ("termId") REFERENCES "UniversityTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

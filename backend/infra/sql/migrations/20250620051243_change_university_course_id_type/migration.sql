/*
  Warnings:

  - The primary key for the `UniversityCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UniversityCourse` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `VarChar(15)`.
  - You are about to alter the column `courseId` on the `UniversityTermCourse` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `VarChar(15)`.

*/
-- DropForeignKey
ALTER TABLE "UniversityTermCourse" DROP CONSTRAINT "UniversityTermCourse_courseId_fkey";

-- AlterTable
ALTER TABLE "UniversityCourse" DROP CONSTRAINT "UniversityCourse_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(15),
ADD CONSTRAINT "UniversityCourse_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UniversityCourse_id_seq";

-- AlterTable
ALTER TABLE "UniversityTermCourse" ALTER COLUMN "courseId" SET DATA TYPE VARCHAR(15);

-- AddForeignKey
ALTER TABLE "UniversityTermCourse" ADD CONSTRAINT "UniversityTermCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "UniversityCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "University" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityCourse" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "departmentId" BIGINT NOT NULL,

    CONSTRAINT "UniversityCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityDepartment" (
    "id" BIGSERIAL NOT NULL,
    "universityId" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,

    CONSTRAINT "UniversityDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityTerm" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(15) NOT NULL,
    "universityId" BIGINT NOT NULL,

    CONSTRAINT "UniversityTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityTermCourse" (
    "courseId" BIGINT NOT NULL,
    "termId" BIGINT NOT NULL,
    "whatsapp" VARCHAR(50)
);

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(24) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UniversityTermCourse_courseId_termId_key" ON "UniversityTermCourse"("courseId", "termId");

-- AddForeignKey
ALTER TABLE "UniversityCourse" ADD CONSTRAINT "UniversityCourse_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "UniversityDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityDepartment" ADD CONSTRAINT "UniversityDepartment_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityTerm" ADD CONSTRAINT "UniversityTerm_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityTermCourse" ADD CONSTRAINT "UniversityTermCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "UniversityCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityTermCourse" ADD CONSTRAINT "UniversityTermCourse_termId_fkey" FOREIGN KEY ("termId") REFERENCES "UniversityTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

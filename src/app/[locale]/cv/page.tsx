import { setRequestLocale } from "next-intl/server";
import { loadCvData } from "@/lib/cv/data";
import {
  CvLayout,
  CvHeader,
  CvContact,
  CvProfile,
  CvExperience,
  CvEducation,
  CvSkills,
  CvLanguages,
  CvCertifications,
  CvSoftSkills,
  CvInterests,
  CvReferences,
} from "@/components/cv";

type Locale = "en" | "de" | "es" | "ar";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CvPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = loadCvData("public");
  const cvLocale = locale as Locale;

  return (
    <CvLayout>
      <div className="flex flex-col gap-6 print:gap-4">
        <CvHeader basics={data.basics} locale={cvLocale} showPhoto={false} />
        <CvContact basics={data.basics} locale={cvLocale} />
        <CvProfile profile={data.profile} locale={cvLocale} />
        <CvExperience experience={data.experience} locale={cvLocale} />
        <CvEducation education={data.education} locale={cvLocale} />
        <CvSkills skills={data.skills} locale={cvLocale} />
        <CvLanguages languages={data.languages} locale={cvLocale} />
        {data.certifications && data.certifications.length > 0 && (
          <CvCertifications certifications={data.certifications} />
        )}
        {data.softSkills && (
          <CvSoftSkills softSkills={data.softSkills} locale={cvLocale} />
        )}
        {data.interests && data.interests.length > 0 && (
          <CvInterests interests={data.interests} locale={cvLocale} />
        )}
        {data.references && data.references.length > 0 && (
          <CvReferences references={data.references} locale={cvLocale} />
        )}
      </div>
    </CvLayout>
  );
}

import React from 'react';
import { Course } from './types';

interface PopularCoursesProps {
  courses: Course[];
}

export const PopularCourses: React.FC<PopularCoursesProps> = ({ courses }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Popüler Eğitimler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="popular-course-card">
            <img src={course.image} alt={course.title} className="w-24 h-24 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{course.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{course.instructor}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-600">{course.rating} / 5</span>
              <span className="text-sm text-gray-500">{course.students} öğrenci</span>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Seviye:</span>
                <span>{course.level}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Süre:</span>
                <span>{course.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
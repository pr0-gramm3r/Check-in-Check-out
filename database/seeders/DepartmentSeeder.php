<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Seed the default departments used by the signup form.
     */
    public function run(): void
    {
        $departments = [
            'Engineering',
            'Sales',
            'Human Resources',
            'Finance',
            'Design',
            'Marketing',
            'Operations',
            'Customer Support',
        ];

        foreach ($departments as $index => $name) {
            Department::firstOrCreate(
                ['name' => $name],
                ['color' => $index % 6],
            );
        }
    }
}

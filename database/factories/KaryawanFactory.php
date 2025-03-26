<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Karyawan>
 */
class KaryawanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = fake()->randomElement(['LAKI-LAKI', 'PEREMPUAN']) == "LAKI-LAKI" ? 'male' : 'female';

        return [
            'nama_lengkap' => fake()->name($gender),
            'username' => fake()->userName(),
            'email' => fake()->safeEmail(),
            'password' => Hash::make('password'),
            'jenis_kelamin' => $gender == 'male' ? "LAKI-LAKI" : 'PEREMPUAN',
            'nomor_telepon' => fake()->phoneNumber(),
            'alamat' => fake()->address(),
            'tanggal_lahir' => fake()->date($format='Y-m-d', $max=now()->subYears(17)->format('Y-m-d'))
        ];
    }
}

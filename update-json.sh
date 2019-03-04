#!/bin/bash
cd "$(dirname "$0")"
gsjson 1f8OJIQhpycljDQ8QNDk_va1GJ1u7RVoMaNjFcHH0LKk -w "Record Materia" -b enlir_json/recordMateria.json
echo "RM done"
gsjson 1f8OJIQhpycljDQ8QNDk_va1GJ1u7RVoMaNjFcHH0LKk -w "Soul Breaks" -b enlir_json/soulbreaks.json
echo "SB done"
gsjson 1f8OJIQhpycljDQ8QNDk_va1GJ1u7RVoMaNjFcHH0LKk -w "Status" -b enlir_json/status.json
echo "status done"
gsjson 1f8OJIQhpycljDQ8QNDk_va1GJ1u7RVoMaNjFcHH0LKk -w "Abilities" -b enlir_json/abilities.json
echo "ability done"
gsjson 1f8OJIQhpycljDQ8QNDk_va1GJ1u7RVoMaNjFcHH0LKk -w "Brave" -b enlir_json/braveCommands.json
echo "brave done"
gsjson 1f8OJIQhpycljDQ8QNDk_va1GJ1u7RVoMaNjFcHH0LKk -w "Burst" -b enlir_json/bsbCommands.json
echo "bsb cmd done"
gsjson 1f8OJIQhpycljDQ8QNDk_va1GJ1u7RVoMaNjFcHH0LKk -w "Legend Materia" -b enlir_json/legendMateria.json
echo "LM done"
gsjson 1f8OJIQhpycljDQ8QNDk_va1GJ1u7RVoMaNjFcHH0LKk -w "Other" -b enlir_json/other.json
echo "All done"

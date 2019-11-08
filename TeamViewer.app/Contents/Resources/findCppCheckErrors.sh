#!/bin/sh

CPPCHECK=${PROJECT_DIR}/../../Tools/CppCheck

CHANGED_FILES="$(svn status | grep -E '^[A,M]{1}' | grep -E '\.mm|\.cpp$' | awk '{ print $2 }')"
CHANGED_FILES_COUNT=`echo ${CHANGED_FILES[@]} | wc -w | awk '{print $1}'`

if [ $CHANGED_FILES_COUNT -eq 0 ]; then
	echo "No changes in working copy."
	exit 0
fi

echo "Check $CHANGED_FILES_COUNT modified/added file(s):"
echo "${CHANGED_FILES}"

cppcheck	-q \
			--error-exitcode=2 \
			--suppress=missingInclude \
			--enable=style,performance,portability \
			--force \
			--platform=unix64 \
			--rule-file=$CPPCHECK/MutexLockedOnlyTemporarily.rule.txt \
			--rule-file=$CPPCHECK/UnsafeUsageOfWeakPtrLock.rule.txt \
			--rule-file=$CPPCHECK/VariablesShouldNotBeNamedId.rule.txt \
			--template=gcc \
			${CHANGED_FILES}

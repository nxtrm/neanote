# KNOWN ISSUES

Notes

Habits

2. Add a last week's visualisation of completed streak in EditHabits
3.  fix checkbox not updating in linked tasks
4.  Fix linked tasks not being returned
17. Fix date


# TASK LIST

- add sorting into sort params
- simplify deletion


- simplify frontend validation and other logic
- create the dashboard arrangable grid with dummy components
    - elements from Habits issue #2
- optionally add events note type with google maps + calendar integration

# IDEAS OR DO-LATER

- Image append

## SearchBar
- Optionally add search by category and tags -> hash tables to quickly look up notes by title or tags (hash table)

## Summarization
- expand dataset
- implement text streaming
- optionally replace the menu with summary-proofread-improve
- add tokens and request limits
- store preferred user summarization model in preferences

## Tasks
- Implement completion timestamps when all subtasks are completed (easy)

































//
CREATE OR REPLACE FUNCTION cosine_similarity(vec1 double precision[], vec2 double precision[])
RETURNS double precision AS $$
DECLARE
    dot_product double precision := 0;
    norm_a double precision := 0;
    norm_b double precision := 0;
    i int;
BEGIN
    FOR i IN array_lower(vec1, 1)..array_upper(vec1, 1) LOOP
        dot_product := dot_product + (vec1[i] * vec2[i]);
        norm_a := norm_a + (vec1[i] * vec1[i]);
        norm_b := norm_b + (vec2[i] * vec2[i]);
    END LOOP;
    IF norm_a = 0 OR norm_b = 0 THEN
        RETURN 0;
    END IF;
    RETURN dot_product / (sqrt(norm_a) * sqrt(norm_b));
END;
$$ LANGUAGE plpgsql;
import {
    AbstractRepository,
    DeleteResult,
    FindConditions,
    FindManyOptions,
    ObjectID,
    ObjectType,
    RemoveOptions,
    Repository,
    InsertResult
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

import { getConnection } from "../middleware";

type CacheTypes = { [type in CacheType]: number };

/**
 * An object describing some standard cache options for typeorm/graphql.
 */
export const cacheOptions: CacheTypes = {
    /**
     * Don't cache.
     */
    "no-cache": 0,

    /**
     * Cache for 1 second.
     */
    "short-cache": 1,

    /**
     * Cache for 1 minute.
     */
    "long-cache": 60
};

export default class AbstractResolver<Entity> extends AbstractRepository<Entity> {
    protected async getConnection<Connection>() {
        return await getConnection();
    }

    protected async queryBuilder(target: ObjectType<Entity>) {
        const conn = await getConnection();

        return conn.createQueryBuilder<Entity>(target, target.name);
    }

    /**
     * Retrieves the default repository for the specified entity.
     * @param target The target entity type to retrieve a repository for.
     */
    protected async getRepo(target: ObjectType<Entity>): Promise<Repository<Entity>> {
        const conn = await getConnection();

        return await conn.getRepository(target);
    }

    /**
     * Retrieves all records for the specified entity, filtered by the provided options.
     * @param target The target entity type to retrieve data for.
     * @param options The options to filter results by.
     * @param cache How long to cache the results of this query.
     */
    protected async find(
        target: ObjectType<Entity>,
        options: FindManyOptions<Entity>,
        cache: CacheType = "no-cache"
    ): Promise<Entity[]> {
        const repo = await this.getRepo(target);

        return await repo.find(
            Object.assign(
                {
                    cache: cacheOptions[cache] * 1000 || false // typeorm wants the cache time in ms.
                },
                options
            )
        );
    }

    /**
     * Retrieves a single record for the specified entity, filtered by the provided options,
     * or undefined if no record is found.
     * @param target The target entity type to retrieve data for.
     * @param options The options to filter results by.
     * @param cache How long to cache the results of this query.
     */
    protected async findOne(
        target: ObjectType<Entity>,
        options: FindManyOptions<Entity>,
        cache: CacheType = "no-cache"
    ): Promise<Entity | undefined> {
        const repo = await this.getRepo(target);

        return await repo.findOne(
            Object.assign(
                {
                    cache: cacheOptions[cache] * 1000 || false // typeorm wants the cache time in ms.
                },
                options
            )
        );
    }

    /**
     * Retrieves a single record for the specified entity, filtered by the provided options.
     * @param target The target entity type to retrieve data for.
     * @param options The options to filter results by.
     * @param cache How long to cache the results of this query.
     */
    protected async findOneOrFail(
        target: ObjectType<Entity>,
        options: FindManyOptions<Entity>,
        cache: CacheType = "no-cache"
    ): Promise<Entity> {
        const repo = await this.getRepo(target);

        return await repo.findOneOrFail(
            Object.assign(
                {
                    cache: cacheOptions[cache] * 1000 || false // typeorm wants the cache time in ms.
                },
                options
            )
        );
    }

    /**
     * Retrieves all records for the specified entity.
     * @param target The target entity type to retrieve data for.
     * @param cache How long to cache the results of this query.
     */
    protected async all(
        target: ObjectType<Entity>,
        cache: CacheType = "no-cache"
    ): Promise<Entity[]> {
        return await this.find(target, {}, cache);
    }

    /**
     * Deletes the record matching provided criteria
     * @param target The target entity type to delete from
     * @param criteria Criteria for deletion. Accepts ID, array of IDs, find object, and more!
     * @return The number of rows affected by the query
     */
    protected async delete(
        target: ObjectType<Entity>,
        criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | any
    ): Promise<number> {
        const repo = await this.getRepo(target);
        const result: DeleteResult = await repo.delete(criteria);

        return result.raw.affectedRows;
    }

    /**
     * Remove entities from the database by object reference
     * @param target The target entity type to remove from
     * @param entities Array of entities to remove
     * @param options Special options passed to the typeorm remove function
     */
    protected async remove(
        target: ObjectType<Entity>,
        entities: Entity[],
        options: RemoveOptions
    ): Promise<Entity[]> {
        const repo = await this.getRepo(target);

        return await repo.remove(entities, options);
    }

    /**
     * Partially updates the record matching provided criteria
     * @param target The target entity type to update data for.
     * @param options The options to update entities by.
     * @param partialEntity The data for updating target entity.
     * @return Array of updated entities
     */
    protected async update(
        target: ObjectType<Entity>,
        options: FindConditions<Entity>,
        partialEntity: QueryDeepPartialEntity<Entity>
    ): Promise<Entity[]> {
        const repo = await this.getRepo(target);
        await repo.update(options, partialEntity);

        return await repo.find(options);
    }

    /**
     * Inserts a given entity into the database.
     * @param target The target entity type to insert data for.
     * @param entity The data for insert target entity
     * @return Array of inserted entities
     */
    protected async insert(
        target: ObjectType<Entity>,
        entity: QueryDeepPartialEntity<Entity>
    ): Promise<Entity[]> {
        const repo = await this.getRepo(target);
        const insertResult: InsertResult = await repo.insert(entity);

        return await repo.find({ where: insertResult.identifiers });
    }
}

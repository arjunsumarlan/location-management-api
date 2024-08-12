import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  building: string;

  @Column()
  name: string;

  @Column()
  number: string;

  @Column('float')
  area: number;

  @ManyToOne(() => Location, (location) => location.children)
  parent: Location;

  @OneToMany(() => Location, (location) => location.parent)
  children: Location[];
}

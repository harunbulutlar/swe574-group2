package com.mockingjay.dao;

/***
 * author edemirel 08.03.2015 
 * 
 */
import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;

import com.mockingjay.model.Employee;

public class DataDaoImpl implements DataDao {

	@Autowired
	SessionFactory sessionFactory;

	Session session = null;
	Transaction tx = null;

	@Override
	public boolean addEntity(Employee employee) throws Exception {

		session = sessionFactory.openSession();
		tx = session.beginTransaction();
		session.save(employee);
		tx.commit();
		session.close();

		return false;
	}

	@Override
	public Employee getEntityById(long id) throws Exception {
		session = sessionFactory.openSession();
		Employee employee = (Employee) session.load(Employee.class,
				new Long(id));
		tx = session.getTransaction();
		session.beginTransaction();
		tx.commit();
		return employee;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Employee> getEntityList() throws Exception {
		session = sessionFactory.openSession();
		tx = session.beginTransaction();
		List<Employee> employeeList = session.createCriteria(Employee.class)
				.list();
		tx.commit();
		session.close();
		return employeeList;
	}
	
	@Override
	public boolean deleteEntity(long id)
			throws Exception {
		session = sessionFactory.openSession();
		Object o = session.load(Employee.class, id);
		tx = session.getTransaction();
		session.beginTransaction();
		session.delete(o);
		tx.commit();
		return false;
	}

}